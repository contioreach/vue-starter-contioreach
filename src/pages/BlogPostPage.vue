<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BlogDetail from "@/components/blog/BlogDetail.vue";
import CTASection from "@/components/blog/CTASection.vue";
import LoadingAnnouncer from "@/components/blog/LoadingAnnouncer.vue";
import LoadingState from "@/components/blog/LoadingState.vue";
import NotFoundPage from "./NotFoundPage.vue";
import { getPost } from "@/lib/api";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";
import { useSeo } from "@/lib/seo";
import { useSite } from "@/lib/site";
import { useAsync } from "@/lib/useAsync";

const route = useRoute();
const site = useSite();

const slug = computed(() => route.params.slug);
const { data, error, loading } = useAsync(() => getPost(slug.value), [slug]);

const post = computed(() => data.value?.post);
// A missing post renders the 404 page, which also carries `noindex`.
const missing = computed(() => error.value?.status === 404);

useSeo(() => {
  if (!post.value) return {};

  return {
    title: `${post.value.title} | ContioReach`,
    description: post.value.description || post.value.excerpt,
    path: `/blog/${post.value.slug}`,
    image: post.value.coverImage || undefined,
    alt: post.value.title,
    type: "article",
    publishedTime: post.value.publishedAt,
    modifiedTime: post.value.updatedAt,
    keywords: [
      post.value.category?.toLowerCase(),
      post.value.primaryKeyword,
      ...(post.value.tags?.map((tag) => tag.name?.toLowerCase()) || []),
      "headless cms",
      "content marketing",
      "blog",
    ],
    /* Home > Blog > Article — the leaf uses the post's own title rather than
       the SEO title with its site suffix. */
    jsonLd: [
      breadcrumbSchema(
        [
          { name: "Blog", path: "/blog" },
          { name: post.value.title, path: `/blog/${post.value.slug}` },
        ],
        site.siteUrl,
      ),
      blogPostingSchema(post.value, site.siteUrl),
    ],
  };
});
</script>

<template>
  <NotFoundPage v-if="missing" />

  <template v-else-if="loading">
    <LoadingAnnouncer loading />
    <LoadingState variant="article" />
  </template>

  <div v-else-if="error" class="mx-auto max-w-lg px-6 py-32 text-center">
    <h1 class="text-2xl font-semibold text-white">Couldn't load this article</h1>
    <p class="mt-3 text-zinc-400">Try again in a moment.</p>
  </div>

  <template v-else>
    <BlogDetail :post="post" :related-blogs="data.related" />
    <CTASection />
  </template>
</template>
