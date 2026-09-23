# Vue Headless CMS Starter

A complete, production-shaped blog built with **plain Vue 3 and Vite** — no meta-framework — and a **headless CMS**, using [ContioReach](https://contioreach.com) as the content backend.

The Vue app is an ordinary client-side SPA. Alongside it sits a small API server that holds the CMS key, caches reads with real tag invalidation, answers the publish webhook, and fills in the document head so crawlers get something real.

```bash
npx degit contioreach/vue-starter-contioreach my-blog
cd my-blog && npm install
cp .env.example .env   # add your API key
npm run dev
```

> Looking for another stack? See the [Next.js](https://github.com/contioreach/nextjs-starter-contioreach), [Nuxt](https://github.com/contioreach/nuxtjs-starter-contioreach), [Astro](https://github.com/contioreach/astro-starter-contioreach), [SvelteKit](https://github.com/contioreach/sveltekit-starter-contioreach), [Remix](https://github.com/contioreach/remix-starter-contioreach) and [React](https://github.com/contioreach/react-starter-contioreach) examples.

---

## Read this before you choose this one

A client-side Vue app has two problems that a blog in particular cares about, and this repo is built around solving them honestly rather than pretending they don't exist.

**1. A browser cannot keep a secret.** If Vue called the CMS directly, `CMS_API_KEY` would be in the JavaScript bundle and visible to anyone who opens devtools. So it doesn't: the Vue app only ever talks to this repo's own API server, on the same origin, and that server holds the key. Everything under `server/` is outside the Vite build. (Verified, not assumed — neither the key nor the CMS hostname appears anywhere in `dist/client`.)

**2. Crawlers arrive before your JavaScript runs.** A SPA's first byte is an empty `<div id="app">`. Google will usually execute the JavaScript eventually, but "eventually" is not a crawl budget you control, and social previews, link unfurlers and AI answer engines mostly don't run JavaScript at all.

So before sending `index.html`, the server fills in the head for that route — real `<title>`, description, canonical, Open Graph, Twitter card and JSON-LD, from the same cached CMS data the API would return ([`server/seo.js`](server/seo.js)). It also answers with the **right status code**: because the server resolved the route against the CMS, `/blog/does-not-exist` returns a genuine `404`, not the `200` a client-side router gives everything. That "soft 404" is a problem search engines name explicitly, and it is the default failure mode of SPA routing.

**Be clear about what that buys you.** The *metadata* is genuinely server-rendered and correct on first byte. The article *body* is still rendered by Vue in the browser. That is a real improvement over shipping nothing, and it is the right trade if you want a plain-Vue codebase.

**But if organic search is the main channel for this content, pick a server-rendered example instead.** If you like Vue, [Nuxt](https://github.com/contioreach/nuxtjs-starter-contioreach) is the direct upgrade — same components, same template syntax, server-rendered — and porting this repo to it is mostly moving files. [Astro](https://github.com/contioreach/astro-starter-contioreach) also runs Vue components. Those send the full article on first byte. This one is for teams who want plain Vue and are making that trade deliberately.

---

## What's in the box

| Feature | Where |
| --- | --- |
| The SPA: router, pages, components | [`src/`](src/) |
| API server: endpoints, webhook, sitemap, robots | [`server/index.js`](server/index.js) |
| CMS client and transforms | [`server/cms.js`](server/cms.js) |
| Cache: TTL, SWR, single-flight, tags | [`server/cache.js`](server/cache.js) |
| …and its tests | [`server/cache.test.js`](server/cache.test.js) |
| Server-rendered head + real status codes | [`server/seo.js`](server/seo.js) |
| Head during client navigation | [`src/lib/useHead.js`](src/lib/useHead.js), [`src/lib/seo.js`](src/lib/seo.js) |
| Data fetching, written out | [`src/lib/useAsync.js`](src/lib/useAsync.js) |
| Table of contents + stable heading anchors | [`shared/content.js`](shared/content.js) |
| Article typography (raw CMS HTML) | [`src/styles/global.css`](src/styles/global.css) |

Tailwind CSS v4. Three runtime dependencies: Vue, Vue Router and Express. No UI library, no query library, no head library, no database.

---

## 1. Environment variables

```bash
cp .env.example .env
```

```env
CMS_API_URL=https://cms-api.contioreach.com
CMS_API_KEY=cms_xxxxxxxxxxxxxxxxxxxxxxxx
REVALIDATION_SECRET=revalidate_xxxxxxxxxxxx
PUBLIC_SITE_URL=http://localhost:3000
PUBLIC_ALLOW_INDEXING=false
PUBLIC_SIGNUP_URL=https://app.contioreach.com/signup
PUBLIC_LOGIN_URL=https://app.contioreach.com/login
PORT=3000
```

Get `CMS_API_KEY` and `REVALIDATION_SECRET` from your ContioReach workspace settings (the free plan is enough). Every variable is read in one place — [`server/config.js`](server/config.js) — which throws at boot when one is missing. A dead start beats a site that 401s on its first visitor.

The four `PUBLIC_` values are served to the browser at runtime from `GET /api/config`, not baked into the bundle, so one build artifact runs in staging and production.

---

## 2. How the two halves fit together

```
browser ──▶ /api/*  ──▶ server/cms.js ──▶ ContioReach
        ◀── JSON    ◀── server/cache.js (tagged, SWR)

browser ──▶ /blog/x ──▶ server/seo.js fills the <head>, then index.html
```

In development `npm run dev` starts both: the API server on `PORT`, and Vite on its own port with `/api` proxied across, so app code never needs to know the difference. In production the same server serves the built client too — one process, one origin, no CORS.

Components never see the API's shape: a transform layer maps it first, so swapping in Contentful, Sanity or Strapi is `apiRequest` plus two `transform*` functions.

Article bodies are prepared **on the server** ([`shared/content.js`](shared/content.js)): heading anchors added and the table of contents built in the same pass, so the two cannot drift and the browser never re-parses the article.

**Data fetching is forty lines** ([`src/lib/useAsync.js`](src/lib/useAsync.js)) rather than a query library — for four call sites, writing it out is more honest than a dependency. It handles loading and error state, reruns when its watched sources change, and ignores the result of a request a newer navigation has superseded, so clicking quickly between two posts can't render the slower one's response over the newer one.

**Head management is another forty** ([`src/lib/useHead.js`](src/lib/useHead.js)). Vue has no built-in equivalent of React 19's head hoisting, and rather than add a head library for one job this does it directly — with the two things a naive version gets wrong: tags are keyed and reused rather than appended, so navigating between ten posts doesn't leave ten `og:title` tags behind; and the app marks the tags it owns, so its cleanup never removes the ones the server injected for the initial route.

---

## 3. Caching and revalidation

The cache lives on the server, which is the point: one warm entry serves every visitor, and the CMS sees one request instead of one per reader. [`server/cache.js`](server/cache.js), about sixty lines:

- a value is **fresh** for `maxAge` seconds;
- then served **stale** for up to `swr` seconds while one refresh runs behind the request;
- concurrent misses on a cold key **share a single load**;
- a **failing background refresh keeps the stale value**, so a CMS blip doesn't take the page down;
- every entry carries **tags**, and `invalidate(tags)` drops exactly the matching entries.

Hand-written rather than handed to you, so the semantics are pinned by tests — [`cache.test.js`](server/cache.test.js), seven of them, `npm test`. No test runner to install; it's `node:test`.

Responses also carry `s-maxage` and `stale-while-revalidate`, so a CDN in front can hold them on the same schedule. Hashed assets are served `immutable`; HTML never is.

**The webhook.** `POST /api/revalidate/all`:

```bash
curl -X POST https://your-site.com/api/revalidate/all \
  -H 'content-type: application/json' \
  -d '{"secret":"revalidate_xxx","post":{"slug":"my-post"}}'
```

Naming a post adds its `blog-<slug>` tag, so one article can be invalidated without dropping every listing. The response says how many entries went. The secret is accepted in the body or as `X-API-Key`; anything else gets a 401.

**Before you scale out:** the cache is per-process and in-memory, so a webhook that lands on one instance only invalidates that instance. Fine for one server or behind a CDN; with several, put a shared store behind the same `cached()` interface (Redis — the module is small and deliberately easy to swap) or purge the CDN on the same webhook.

---

## 4. SEO

- The head is written twice, and the two agree: by the **server** on first byte ([`server/seo.js`](server/seo.js)), and by **Vue** during client-side navigation ([`src/lib/useHead.js`](src/lib/useHead.js)). No head library.
- `BlogPosting` and `BreadcrumbList` JSON-LD, server-rendered.
- Unknown URLs return a real **404**, not a soft one.
- `/sitemap.xml` is generated from the CMS on request; `/robots.txt` follows the same switch as the meta tags.
- Posts fall back to `/og-default.png` when they have no cover image — drop yours into `public/`.
- **Indexing is off by default.** Until `PUBLIC_ALLOW_INDEXING` is exactly `"true"`, every page ships `noindex, nofollow` and `robots.txt` disallows everything.

---

## 5. Project structure

```
server/          The half that holds secrets — never in the client build
  index.js       Express: /api/*, the webhook, sitemap, robots, index.html
  cms.js         CMS client + transforms
  cache.js       TTL / SWR / single-flight / tags
  cache.test.js  node:test
  config.js      Every env var, validated at boot
  seo.js         Per-route head + real status codes
shared/          Used by both halves
  constants.js   Values that don't vary by environment
  content.js     Article prep — anchors + table of contents
src/             The SPA
  components/    Cards, listing, hero, TOC, share bar, article detail
  pages/         Home, listing, article, category, 404
  lib/           api, useAsync, useHead, site provide/inject, seo, schema, format
  router.js      Routes + scroll restoration
  App.vue        Header, RouterView, footer
  main.js        Boots after fetching /api/config
```

---

## 6. Deploying

`npm run build` writes the client to `dist/client`; `npm start` runs the server, which serves both the API and that directory. Any Node host works — Fly, Render, Railway, a container, a VPS.

It is **one process**, not a static site plus a separate function. If you want to host the client on a CDN and the API elsewhere, split them and set the client's API base URL; nothing else changes.

The `server/` directory is framework-agnostic: nothing in it knows or cares which view layer is calling it. It is the same server as the one in the [React example](https://github.com/contioreach/react-starter-contioreach), give or take a few comments and the repo URL — which is the point. If you prefer a different client, keep this half and replace `src/`.

Set the same environment variables there, with `PUBLIC_SITE_URL` on your real domain, and point the CMS publish webhook at `https://your-domain/api/revalidate/all`.

---

## License

MIT — see [LICENSE](LICENSE). Clone it, strip it back, rebrand it, ship it.
