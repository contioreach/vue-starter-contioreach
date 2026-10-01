import { getCategory, getPost } from "./cms.js";
import { publicConfig } from "./config.js";

/* ---------------------------------------------------------------------------
   Why this file exists

   A client-rendered app sends crawlers an empty <div id="root">. Google will
   usually execute the JavaScript eventually, but "eventually" is not a
   crawl budget you control, and most other crawlers — social previews, AI
   answer engines, link unfurlers — do not run JavaScript at all.

   So before the server sends index.html, it fills in the head for the route
   being requested: real title, description, canonical, Open Graph, Twitter
   card and JSON-LD, from the same cached CMS data the API would return.

   Resolving the route here has a second benefit: the server knows whether a
   post or category actually exists, so a dead URL can answer with a real 404
   instead of the HTTP 200 a SPA would otherwise return for everything. A
   "soft 404" — 200 status, "not found" content — is a problem search engines
   name explicitly, and it is the default failure mode of client-side routing.

   Be clear about what this is and is not. The *metadata* is genuinely
   server-rendered and correct on first byte. The article *body* is still
   rendered by Vue in the browser. That is the right trade for a SPA and it
   is a real improvement over shipping nothing — but if organic search is the
   main channel for this content, one of the server-rendered examples in this
   set (Next.js, Nuxt, Astro, SvelteKit, Remix) will serve it better.
--------------------------------------------------------------------------- */

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function tags({ title, description, path, image, alt, type, publishedTime, modifiedTime, jsonLd, status = 200 }) {
  const { siteUrl, noIndex } = publicConfig();
  const url = `${siteUrl}${path}`;
  const ogImage = image || `${siteUrl}/og-default.png`;

  const out = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta name="robots" content="${noIndex ? "noindex, nofollow" : "index, follow"}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="${escapeHtml(type || "website")}" />`,
    `<meta property="og:site_name" content="ContioReach" />`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(alt || title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`,
  ];

  if (publishedTime) {
    out.push(`<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`);
  }
  if (modifiedTime) {
    out.push(`<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />`);
  }

  for (const block of jsonLd || []) {
    /* JSON we build ourselves, but `<` is still escaped so a stray "</script>"
       inside CMS text can never break out of the tag. */
    const json = JSON.stringify(block).replace(/</g, "\\u003c");
    out.push(`<script type="application/ld+json">${json}</script>`);
  }

  return { head: out.join("\n    "), status };
}

function breadcrumb(crumbs, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}

function blogPosting(post, siteUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description || post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` },
    author: (post.authors?.length ? post.authors : [{ name: "ContioReach" }]).map((author) => ({
      "@type": "Person",
      name: author.name,
      url: author.website || undefined,
    })),
    publisher: { "@type": "Organization", name: "ContioReach", url: siteUrl },
    keywords:
      [post.primaryKeyword, ...(post.secondaryKeywords || []), ...(post.tags?.map((tag) => tag.name) || [])]
        .filter(Boolean)
        .join(", ") || undefined,
  };
}

/* Resolves the head for a pathname. Falls back to the site defaults for
   anything unrecognised, and for a post or category that no longer exists —
   which also gets `noindex`, so a dead URL cannot be indexed. */
export async function headFor(pathname) {
  const { siteUrl } = publicConfig();

  if (pathname === "/") {
    return tags({
      title: "Vue Headless CMS Example | ContioReach",
      description:
        "An open-source Vue 3 (Vite) blog powered by a headless CMS — a client-side SPA with a small API server handling caching, tag invalidation and publish webhooks.",
      path: "/",
      jsonLd: [breadcrumb([], siteUrl)],
    });
  }

  if (pathname === "/blog") {
    return tags({
      title: "Blog | Headless CMS, SEO & Content Strategy | ContioReach",
      description:
        "Practical guides on headless CMS, SEO, AI search, blogging, and the workflows behind content that gets discovered, read, and cited.",
      path: "/blog",
      jsonLd: [breadcrumb([{ name: "Blog", path: "/blog" }], siteUrl)],
    });
  }

  const categoryMatch = pathname.match(/^\/blog\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const slug = decodeURIComponent(categoryMatch[1]);
    const category = await getCategory(slug);

    if (!category) {
      return tags({
        title: "Category Not Found | ContioReach Blog",
        description: "The requested category could not be found.",
        path: pathname,
        jsonLd: [],
        status: 404,
      });
    }

    const lower = category.name.toLowerCase();
    return tags({
      title: `${category.name} Articles | ContioReach Blog`,
      description:
        category.description ||
        `Expert insights, strategies, and guides on ${lower}. Browse every ${lower} article on the ContioReach blog.`,
      path: `/blog/category/${slug}`,
      alt: `${category.name} articles on the ContioReach blog`,
      jsonLd: [
        breadcrumb(
          [
            { name: "Blog", path: "/blog" },
            { name: category.name, path: `/blog/category/${slug}` },
          ],
          siteUrl,
        ),
      ],
    });
  }

  const postMatch = pathname.match(/^\/blog\/([^/]+)\/?$/);
  if (postMatch) {
    const slug = decodeURIComponent(postMatch[1]);
    const post = await getPost(slug);

    if (!post) {
      return tags({
        title: "Blog Post Not Found | ContioReach",
        description: "The requested blog post could not be found.",
        path: pathname,
        jsonLd: [],
        status: 404,
      });
    }

    return tags({
      title: post.metaTitle !== post.title ? post.metaTitle : `${post.title} | ContioReach`,
      description: post.description || post.excerpt,
      path: `/blog/${post.slug}`,
      image: post.coverImage || undefined,
      alt: post.coverImageAlt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      jsonLd: [
        breadcrumb(
          [
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ],
          siteUrl,
        ),
        blogPosting(post, siteUrl),
      ],
    });
  }

  return tags({
    title: "Page not found | ContioReach",
    description: "The page you were looking for could not be found.",
    path: pathname,
    jsonLd: [],
    status: 404,
  });
}
