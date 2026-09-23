<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BlogHero from "@/components/blog/BlogHero.vue";
import BlogListing from "@/components/blog/BlogListing.vue";
import CategoryPills from "@/components/blog/CategoryPills.vue";
import CTASection from "@/components/blog/CTASection.vue";
import ErrorState from "@/components/blog/ErrorState.vue";
import LoadingAnnouncer from "@/components/blog/LoadingAnnouncer.vue";
import LoadingState from "@/components/blog/LoadingState.vue";
import Pagination from "@/components/blog/Pagination.vue";
import { getListing } from "@/lib/api";
import { breadcrumbSchema } from "@/lib/schema";
import { useSeo } from "@/lib/seo";
import { useSite } from "@/lib/site";
import { useAsync } from "@/lib/useAsync";
import { POSTS_PER_PAGE } from "#shared/constants.js";

const route = useRoute();
const site = useSite();

const currentPage = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1));

const { data, error, loading } = useAsync(
  () => getListing({ page: currentPage.value, limit: POSTS_PER_PAGE }),
  [currentPage],
);

useSeo(() => ({
  title: "Blog | Headless CMS, SEO & Content Strategy | ContioReach",
  description:
    "Practical guides on headless CMS, SEO, AI search, blogging, and the workflows behind content that gets discovered, read, and cited.",
  path: "/blog",
  alt: "The ContioReach blog",
  keywords: [
    "headless cms blog",
    "content marketing",
    "seo tips",
    "ai search optimization",
    "blogging workflow",
    "content strategy",
  ],
  jsonLd: [breadcrumbSchema([{ name: "Blog", path: "/blog" }], site.siteUrl)],
}));
</script>

<template>
  <LoadingAnnouncer :loading="loading" />

  <BlogHero
    paragraph="Headless CMS, SEO, AI search, and the workflows behind content that gets discovered, read, and cited."
    :stat="data?.meta?.total ? `${data.meta.total} articles and counting` : null"
  >
    <template #heading>
      Writing about the craft of
      <span
        class="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
      >
        publishing well
      </span>
    </template>
  </BlogHero>

  <div class="mx-auto max-w-7xl space-y-12 px-6 py-14">
    <LoadingState v-if="loading" />
    <ErrorState v-else-if="error" title="Couldn't load these articles" />
    <template v-else>
      <CategoryPills :categories="data.categories" />
      <BlogListing :posts="data.posts" :feature-first="currentPage === 1" />
      <Pagination :meta="data.meta" base-path="/blog" />
    </template>
  </div>

  <CTASection />
</template>
