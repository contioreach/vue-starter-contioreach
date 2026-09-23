<script setup>
import { CMS_SITE_URL, REPO_URL } from "#shared/constants.js";
import { useSite } from "@/lib/site";

const site = useSite();
const year = new Date().getFullYear();
</script>

<template>
  <footer class="border-t border-white/10 bg-zinc-950">
    <div class="mx-auto max-w-7xl px-6 py-10">
      <p class="max-w-xl text-sm leading-relaxed text-zinc-500">
        An open-source example: every post on this site is fetched at build and revalidation time
        from the
        <a :href="CMS_SITE_URL" class="text-zinc-300 underline-offset-4 hover:underline">
          ContioReach
        </a>
        headless CMS. Clone it, point it at your own workspace, and ship.
      </p>
      <div
        class="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center"
      >
        <p>MIT licensed · © {{ year }} ContioReach</p>
        <nav class="flex flex-wrap gap-6 sm:ml-auto">
          <RouterLink to="/blog" class="transition hover:text-white">Blog</RouterLink>
          <a :href="REPO_URL" target="_blank" rel="noopener noreferrer" class="transition hover:text-white">
            GitHub
          </a>
          <a :href="site.signupUrl" class="transition hover:text-white">Start free</a>
        </nav>
      </div>
    </div>
  </footer>
</template>
