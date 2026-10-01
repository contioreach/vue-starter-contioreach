<script setup>
import { formatDate, initials, readingTimeFor } from "@/lib/format";
import { useSite } from "@/lib/site";
import { computed } from "vue";
import Aurora from "./Aurora.vue";
import AuthorCard from "./AuthorCard.vue";
import BlogCard from "./BlogCard.vue";
import MetaCell from "./MetaCell.vue";
import RailCta from "./RailCta.vue";
import ReadingProgress from "./ReadingProgress.vue";
import ShareBar from "./ShareBar.vue";
import TableOfContents from "./TableOfContents.vue";
/* The article body arrives already prepared — anchored HTML plus the TOC — from
   server/api/posts/[slug].get.js, so nothing here re-parses it. */
const props = defineProps({
  post: { type: Object, required: true },
  relatedBlogs: { type: Array, default: () => [] },
});

const site = useSite();

const published = computed(() => formatDate(props.post.publishedAt, { month: "long" }));

/* Only shown when it differs from the publish date — "Updated" repeating the
   same day reads as a bug. */
const updated = computed(() => {
  const { updatedAt, publishedAt } = props.post;
  if (!updatedAt || updatedAt.slice(0, 10) === (publishedAt || "").slice(0, 10)) return null;
  return formatDate(updatedAt, { month: "long" });
});

const reading = computed(() => readingTimeFor(props.post));
const url = computed(() => `${site.siteUrl}/blog/${props.post.slug}`);
</script>

<template>
  <article>
    <ReadingProgress />

    <header class="relative overflow-hidden border-b border-white/10">
      <Aurora />
      <div class="relative mx-auto max-w-4xl px-6 pt-14 pb-12 sm:pt-20">
        <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <RouterLink to="/blog" class="transition hover:text-white">Blog</RouterLink>
          <template v-if="post.categorySlug">
            <span aria-hidden="true">/</span>
            <RouterLink :to="`/blog/category/${post.categorySlug}`" class="transition hover:text-white">
              {{ post.category }}
            </RouterLink>
          </template>
        </nav>

        <h1 class="mt-5 text-4xl leading-[1.08] font-semibold text-balance text-white sm:text-5xl">
          {{ post.title }}
        </h1>

        <p
          v-if="post.excerpt || post.description"
          class="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-zinc-400"
        >
          {{ post.excerpt || post.description }}
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-white/10 pt-6">
          <div v-if="post.author" class="flex items-center gap-3">
            <img
              v-if="post.author.image"
              :src="post.author.image"
              :alt="post.author.name || ''"
              width="40"
              height="40"
              decoding="async"
              class="h-10 w-10 rounded-full object-cover ring-1 ring-white/15"
            >
            <span
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-200"
            >
              {{ initials(post.author.name) }}
            </span>
            <MetaCell label="Author" :value="post.author.name" />
          </div>
          <MetaCell v-if="published" label="Published" :value="published" />
          <MetaCell v-if="updated" label="Updated" :value="updated" />
          <MetaCell v-if="reading" label="Read time" :value="reading" />
          <div class="sm:ml-auto">
            <ShareBar :url="url" :title="post.title" />
          </div>
        </div>
      </div>
    </header>

    <div v-if="post.coverImage" class="mx-auto max-w-5xl px-6">
      <div class="relative aspect-[16/8] overflow-hidden rounded-3xl border border-white/10 sm:-mt-10">
        <img
          :src="post.coverImage"
          :alt="post.coverImageAlt || post.title"
          fetchpriority="high"
          decoding="async"
          class="absolute inset-0 h-full w-full object-cover"
        >
      </div>
    </div>

    <div class="mx-auto grid max-w-7xl gap-12 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <!-- Body HTML comes from our own CMS. -->
      <div class="blog-content" v-html="post.html || '<p>No content available.</p>'" />

      <aside class="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <TableOfContents :items="post.toc || []" />
        <AuthorCard :author="post.author" />
        <RailCta :slug="post.slug" />
      </aside>
    </div>

    <div v-if="post.tags?.length" class="mx-auto max-w-7xl px-6 pb-8">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in post.tags"
          :key="tag.id || tag.slug || tag.name"
          class="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400"
        >
          #{{ tag.name }}
        </span>
      </div>
    </div>

    <section v-if="relatedBlogs.length" class="border-t border-white/10">
      <div class="mx-auto max-w-7xl px-6 py-16">
        <div class="mb-8 flex items-end justify-between gap-4">
          <h2 class="text-2xl font-semibold text-white sm:text-3xl">Keep reading</h2>
          <RouterLink to="/blog" class="text-sm text-zinc-400 transition hover:text-white">
            All articles →
          </RouterLink>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BlogCard v-for="related in relatedBlogs" :key="related.id || related.slug" :post="related" />
        </div>
      </div>
    </section>
  </article>
</template>
