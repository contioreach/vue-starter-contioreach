<script setup>
/* What this example actually demonstrates — the reason a developer landed here
   from a search result. Each item points at the file that implements it. */
const features = [
  {
    title: "The key never reaches the browser",
    body: "A client-side SPA cannot hold a secret. A small API server does, and the Vue app only ever talks to that — so the CMS key is not in the bundle.",
    file: "server/index.js",
  },
  {
    title: "Server-side cache with real tags",
    body: "TTL, stale-while-revalidate, single-flight refresh and tag invalidation in about sixty lines — on the server, so one warm entry serves every visitor.",
    file: "server/cache.js",
  },
  {
    title: "Crawlers get a real head",
    body: "Before index.html is sent, the server fills in the title, canonical, Open Graph and JSON-LD for that route, and answers 404 for URLs that do not exist.",
    file: "server/seo.js",
  },
  {
    title: "On-demand revalidation",
    body: "A signed webhook from the CMS drops exactly the entries carrying a tag, so a published post goes live immediately without a redeploy.",
    file: "server/index.js",
  },
  {
    title: "Head management, written out",
    body: "Vue has no equivalent of React 19's head hoisting. Forty lines keep the title, meta and JSON-LD correct across navigations without a head library.",
    file: "src/lib/useHead.js",
  },
  {
    title: "One CMS boundary",
    body: "Two functions stand between your components and the API. Swap in Contentful, Sanity or Strapi without touching a component.",
    file: "server/cms.js",
  },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16 sm:py-20">
    <h2 class="text-3xl font-semibold text-white sm:text-4xl">What this example demonstrates</h2>
    <p class="mt-2 max-w-2xl text-zinc-400">
      The parts most headless CMS tutorials leave out — and where to find each one in the repo.
    </p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
      >
        <h3 class="font-semibold text-white">{{ feature.title }}</h3>
        <p class="mt-2.5 text-sm leading-relaxed text-zinc-400">{{ feature.body }}</p>
        <code class="mt-4 block font-mono text-xs break-all text-cyan-300/80">{{ feature.file }}</code>
      </div>
    </div>
  </section>
</template>
