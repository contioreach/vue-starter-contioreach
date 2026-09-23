<script setup>
import Aurora from "@/components/blog/Aurora.vue";
import { useSeo } from "@/lib/seo";

defineProps({ title: { type: String, default: "We couldn't find that page" } });

// A 404 should never be indexed, whatever the site-wide switch says.
useSeo(() => ({
  title: "Page not found | ContioReach",
  description: "The page you were looking for could not be found.",
  path: "/404",
  noIndex: true,
}));
</script>

<template>
  <div class="relative flex items-center overflow-hidden">
    <Aurora />
    <div class="relative mx-auto max-w-xl px-6 py-32 text-center">
      <p class="font-mono text-sm text-zinc-500">404</p>
      <h1 class="mt-4 text-4xl font-semibold text-balance text-white sm:text-5xl">{{ title }}</h1>
      <p class="mx-auto mt-5 max-w-md leading-relaxed text-pretty text-zinc-400">
        The article may have been moved or unpublished. The blog index is a good place to pick up
        again.
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <RouterLink
          to="/blog"
          class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          Browse the blog
        </RouterLink>
        <RouterLink
          to="/"
          class="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50"
        >
          Back home
        </RouterLink>
      </div>
    </div>
  </div>
</template>
