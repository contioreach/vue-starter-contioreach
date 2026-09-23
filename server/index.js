import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { CACHE_TAGS, POSTS_PER_PAGE, REVALIDATE_TIME } from "../shared/constants.js";
import { prepareContent } from "../shared/content.js";
import { invalidate } from "./cache.js";
import {
  getAllBlogSlugs,
  getAllCategorySlugs,
  getCategory,
  getPost,
  getRelated,
  loadListing,
} from "./cms.js";
import { PORT, assertConfig, publicConfig, revalidationSecret } from "./config.js";
import { headFor } from "./seo.js";

/* The whole server half of this example: it holds the CMS key, caches reads
   with tags, answers the publish webhook, and fills in the head of index.html
   before sending it. The Vue app never talks to the CMS directly. */

assertConfig();

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const clientDir = path.join(root, "dist/client");
const isProduction = process.env.NODE_ENV !== "development";

const app = express();
app.use(express.json());
app.disable("x-powered-by");

/* The in-process cache keeps these off the CMS; these headers let a CDN in
   front of the app hold the responses too. */
const cacheHeader = `public, max-age=0, s-maxage=${REVALIDATE_TIME}, stale-while-revalidate=86400`;

/* ---- API ---------------------------------------------------------------- */

// The four values the browser is allowed to know. Never the CMS key.
app.get("/api/config", (_req, res) => {
  res.set("Cache-Control", "public, max-age=0, s-maxage=60");
  res.json(publicConfig());
});

app.get("/api/listing", async (req, res, next) => {
  try {
    const listing = await loadListing({
      page: Math.max(1, Number.parseInt(req.query.page, 10) || 1),
      limit: Math.min(50, Number.parseInt(req.query.limit, 10) || POSTS_PER_PAGE),
      category: req.query.category || undefined,
    });

    res.set("Cache-Control", cacheHeader).json(listing);
  } catch (error) {
    next(error);
  }
});

app.get("/api/posts/:slug", async (req, res, next) => {
  try {
    const post = await getPost(req.params.slug);
    if (!post) return res.status(404).json({ error: "Blog post not found" });

    /* Prepared once here rather than in the browser: one pass produces the
       anchored HTML and the table of contents, so the two cannot drift. */
    const { html, toc } = prepareContent(post.content);
    const related = await getRelated(post.categorySlug, post.id);

    // The raw body is dropped — shipping it alongside the prepared HTML would
    // double the payload for no gain.
    const { content, ...rest } = post;

    res.set("Cache-Control", cacheHeader).json({ post: { ...rest, html, toc }, related });
  } catch (error) {
    next(error);
  }
});

app.get("/api/categories/:slug", async (req, res, next) => {
  try {
    const category = await getCategory(req.params.slug);
    if (!category) return res.status(404).json({ error: "Category not found" });

    res.set("Cache-Control", cacheHeader).json(category);
  } catch (error) {
    next(error);
  }
});

/* Publish webhook from ContioReach. Fired when a post is published, scheduled,
   deleted, or a published post is edited. Body: { secret, post }; the same
   secret is also accepted as the X-API-Key header. */
app.post("/api/revalidate/all", (req, res) => {
  try {
    const body = req.body || {};
    const secret = body.secret || req.get("x-api-key");

    if (secret !== revalidationSecret()) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const tags = Object.values(CACHE_TAGS);

    /* When the webhook names a post, its own tag goes too — the listings are
       dropped by the shared tags either way. */
    if (body.post?.slug) tags.push(`blog-${body.post.slug}`);

    const entries = invalidate(tags);

    console.log("Blog cache revalidated", {
      slug: body.post?.slug ?? null,
      entries,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "All blog cache revalidated successfully",
      revalidated: { tags, entries },
    });
  } catch (error) {
    console.error("Full revalidation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to revalidate blog cache",
      details: error.message,
    });
  }
});

/* ---- sitemap and robots -------------------------------------------------- */

app.get("/sitemap.xml", async (req, res, next) => {
  try {
    const { siteUrl } = publicConfig();
    const [posts, categories] = await Promise.all([getAllBlogSlugs(), getAllCategorySlugs()]);
    const now = new Date().toISOString();

    const entry = (loc, priority) =>
      `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;

    const urls = [
      entry(`${siteUrl}/`, 1),
      entry(`${siteUrl}/blog`, 0.9),
      ...categories.map((c) => entry(`${siteUrl}/blog/category/${c.slug}`, 0.7)),
      ...posts.map((p) => entry(`${siteUrl}/blog/${p.slug}`, 0.8)),
    ];

    res
      .type("application/xml")
      .set("Cache-Control", cacheHeader)
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`,
      );
  } catch (error) {
    next(error);
  }
});

app.get("/robots.txt", (_req, res) => {
  const { siteUrl, noIndex } = publicConfig();

  /* Belt and braces with the per-page `noindex` tags: while the site is closed
     off, crawlers are turned away at the door too. */
  res.type("text/plain").send(
    noIndex
      ? "User-agent: *\nDisallow: /\n"
      : `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  );
});

/* ---- the app itself ------------------------------------------------------ */

if (isProduction) {
  // Hashed assets are immutable; index.html is handled below, never cached.
  app.use(
    express.static(clientDir, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.set("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  /* Every other GET returns index.html with the head filled in for that route.
     This is what gives crawlers a real title, canonical and JSON-LD on first
     byte — see server/seo.js for what this does and does not cover.

     It also carries the right status: because the server resolved the route
     against the CMS, a URL that does not exist answers 404 rather than the
     200 a client-side router would give everything. */
  app.get(/^\/(?!api\/).*/, async (req, res, next) => {
    try {
      const template = await readFile(path.join(clientDir, "index.html"), "utf8");
      const { head, status } = await headFor(req.path);

      res
        .status(status)
        .type("html")
        .set("Cache-Control", status === 200 ? cacheHeader : "no-store")
        .send(template.replace("<!--seo-->", head));
    } catch (error) {
      next(error);
    }
  });
}

app.use((error, _req, res, _next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(
    isProduction
      ? `Serving the app and API on http://localhost:${PORT}`
      : `API server on http://localhost:${PORT} — run the client with npm run dev:client`,
  );
});
