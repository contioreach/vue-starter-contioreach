<script setup>
import { computed } from "vue";
import BlogCard from "./BlogCard.vue";
/* Grid of posts. On page 1 of a listing the first post runs full width as a
   featured card; deeper pages are a plain uniform grid so the "featured"
   treatment keeps meaning something. */
const props = defineProps({
  posts: { type: Array, default: () => [] },
  featureFirst: { type: Boolean, default: true },
});

const featured = computed(() => (props.featureFirst ? props.posts[0] || null : null));
const grid = computed(() => (featured.value ? props.posts.slice(1) : props.posts));
</script>

<template>
  <div
    v-if="posts.length === 0"
    class="mx-auto max-w-lg rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-8 py-16 text-center"
  >
    <p class="text-lg font-medium text-white">Nothing here yet</p>
    <p class="mt-2 text-sm text-zinc-400">
      New articles land regularly — check back shortly, or browse another category.
    </p>
  </div>

  <div v-else class="space-y-8">
    <BlogCard v-if="featured" :post="featured" featured priority />

    <div v-if="grid.length > 0" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <BlogCard
        v-for="(post, index) in grid"
        :key="post.id || post.slug"
        :post="post"
        :priority="!featured && index < 3"
      />
    </div>
  </div>
</template>
