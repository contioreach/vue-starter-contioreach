<script setup>
import { computed } from "vue";
/* Category nav for the listing pages. `active` is the current category slug,
   or null on /blog. */
const props = defineProps({
  categories: { type: Array, default: () => [] },
  active: { type: String, default: null },
});

const items = computed(() => [
  { name: "All posts", slug: null, href: "/blog" },
  ...props.categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    href: `/blog/category/${c.slug}`,
    count: c.postCount,
  })),
]);
</script>

<template>
  <nav v-if="categories.length" aria-label="Blog categories" class="flex flex-wrap justify-center gap-2.5">
    <RouterLink
      v-for="item in items"
      :key="item.href"
      :to="item.href"
      :aria-current="item.slug === active ? 'page' : undefined"
      class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition"
      :class="
        item.slug === active
          ? 'border-transparent bg-white text-zinc-950 shadow-[0_0_30px_-8px_rgba(255,255,255,0.6)]'
          : 'border-white/12 bg-white/[0.04] text-zinc-300 hover:border-white/30 hover:text-white'
      "
    >
      {{ item.name }}
      <span v-if="typeof item.count === 'number'" class="text-zinc-500">{{ item.count }}</span>
    </RouterLink>
  </nav>
</template>
