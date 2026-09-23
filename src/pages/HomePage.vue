<script setup>
import Aurora from "@/components/blog/Aurora.vue";
import BlogListing from "@/components/blog/BlogListing.vue";
import CategoryPills from "@/components/blog/CategoryPills.vue";
import CTASection from "@/components/blog/CTASection.vue";
import ErrorState from "@/components/blog/ErrorState.vue";
import Eyebrow from "@/components/blog/Eyebrow.vue";
import FeatureGrid from "@/components/blog/FeatureGrid.vue";
import LoadingState from "@/components/blog/LoadingState.vue";
import { getListing } from "@/lib/api";
import { useSeo } from "@/lib/seo";
import { useAsync } from "@/lib/useAsync";
import { REPO_URL } from "#shared/constants.js";

// Seven newest posts: one featured card plus two rows.
const { data, error, loading } = useAsync(() => getListing({ page: 1, limit: 7 }));

useSeo(() => ({
  title: "Vue Headless CMS Example | ContioReach",
  description:
    "An open-source Vue 3 (Vite) blog powered by a headless CMS — a client-side SPA with a small API server handling caching, tag invalidation and publish webhooks.",
  path: "/",
  keywords: [
    "headless cms vue example",
    "vue headless cms",
    "vite vue blog",
    "vue spa cms",
    "on-demand revalidation",
  ],
}));
</script>

<template>
  <section class="relative overflow-hidden border-b border-white/10">
    <Aurora />
    <div class="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-32">
      <Eyebrow>Open-source example</Eyebrow>

      <h1 class="mt-6 text-5xl leading-[1.03] font-semibold text-balance text-white sm:text-7xl">
        Vue ×
        <span
          class="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
        >
          headless CMS
        </span>
      </h1>

      <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-zinc-400">
        A complete blog on plain Vue 3 and Vite — no meta-framework. A small API server keeps the
        CMS key server-side, caches reads with real tag invalidation, and answers the publish
        webhook.
      </p>

      <!-- The copy-paste starting point: the first thing a developer who
           arrived from a search result is looking for. -->
      <div
        class="mx-auto mt-9 flex max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
      >
        <span aria-hidden="true" class="font-mono text-sm text-zinc-600">$</span>
        <code class="overflow-x-auto font-mono text-sm whitespace-nowrap text-zinc-200">
          npx degit contioreach/vue-starter-contioreach my-blog
        </code>
      </div>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <a
          :href="REPO_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          View on GitHub
        </a>
        <RouterLink
          to="/blog"
          class="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
        >
          See the live blog →
        </RouterLink>
      </div>

      <p class="mt-6 font-mono text-xs text-zinc-600">
        Vue 3 · Vite · Vue Router · Tailwind CSS v4 · MIT
      </p>
    </div>
  </section>

  <FeatureGrid />

  <section class="mx-auto max-w-7xl border-t border-white/10 px-6 py-16 sm:py-24">
    <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="text-3xl font-semibold text-white sm:text-4xl">Live from the CMS</h2>
        <p class="mt-2 max-w-xl text-zinc-400">
          Not fixtures — these are real posts served through the code in this repo.
        </p>
      </div>
      <RouterLink
        to="/blog"
        class="rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:text-white"
      >
        View all articles →
      </RouterLink>
    </div>

    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" title="Couldn't load the latest posts" />
    <template v-else>
      <div class="mb-10">
        <CategoryPills :categories="data.categories" />
      </div>
      <BlogListing :posts="data.posts" />
    </template>
  </section>

  <CTASection />
</template>
