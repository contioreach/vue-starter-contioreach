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
import NotFoundPage from "./NotFoundPage.vue";
import Pagination from "@/components/blog/Pagination.vue";
import { getCategory, getListing } from "@/lib/api";
import { breadcrumbSchema } from "@/lib/schema";
import { useSeo } from "@/lib/seo";
import { useSite } from "@/lib/site";
import { useAsync } from "@/lib/useAsync";
import { POSTS_PER_PAGE } from "#shared/constants.js";

const route = useRoute();
const site = useSite();

const slug = computed(() => route.params.slug);
const currentPage = computed(() => Math.max(1, Number.parseInt(route.query.page, 10) || 1));

/* Both requests go out together rather than one after the other: the listing
   does not need the category record, only its slug. */
const { data, error, loading } = useAsync(
  () =>
    Promise.all([
      getCategory(slug.value),
      getListing({ page: currentPage.value, limit: POSTS_PER_PAGE, category: slug.value }),
    ]),
  [slug, currentPage],
);

const category = computed(() => data.value?.[0]);
const listing = computed(() => data.value?.[1]);
const missing = computed(() => error.value?.status === 404);
const lower = computed(() => category.value?.name?.toLowerCase() || "");

useSeo(() => {
  if (!category.value) return {};

  return {
    title: `${category.value.name} Articles | ContioReach Blog`,
    description:
      category.value.description ||
      `Expert insights, strategies, and guides on ${lower.value}. Browse every ${lower.value} article on the ContioReach blog.`,
    path: `/blog/category/${slug.value}`,
    alt: `${category.value.name} articles on the ContioReach blog`,
    keywords: [lower.value, slug.value, "headless cms", "content marketing", "blog"],
    // Built from the loaded category so the crumb uses its display name.
    jsonLd: [
      breadcrumbSchema(
        [
          { name: "Blog", path: "/blog" },
          { name: category.value.name, path: `/blog/category/${slug.value}` },
        ],
        site.siteUrl,
      ),
    ],
  };
});
</script>

<template>
  <NotFoundPage v-if="missing" title="We couldn't find that category" />

  <template v-else>
    <LoadingAnnouncer :loading="loading" />

    <BlogHero
      :eyebrow="category?.name || 'Category'"
      :paragraph="
        category?.description ||
        (category
          ? `Expert insights, strategies, and guides on ${lower}, plus what we're learning building ContioReach.`
          : '')
      "
      :stat="listing?.meta?.total ? `${listing.meta.total} articles in this category` : null"
    >
      <template #heading>
        Everything on
        <span
          class="bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
        >
          {{ category?.name || "…" }}
        </span>
      </template>
    </BlogHero>

    <div class="mx-auto max-w-7xl space-y-12 px-6 py-14">
      <LoadingState v-if="loading" />
      <ErrorState v-else-if="error" title="Couldn't load this category" />
      <template v-else>
        <CategoryPills :categories="listing.categories" :active="slug" />
        <BlogListing :posts="listing.posts" :feature-first="currentPage === 1" />
        <Pagination :meta="listing.meta" :base-path="`/blog/category/${slug}`" />
      </template>
    </div>

    <CTASection />
  </template>
</template>
