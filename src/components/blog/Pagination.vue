<script setup>
import { computed } from "vue";
const props = defineProps({
  meta: { type: Object, default: () => ({}) },
  basePath: { type: String, default: "/blog" },
});

/* Builds the window of page numbers around the current page, with `null`
   standing in for an ellipsis. */
function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const out = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) out.push(null);
    out.push(page);
    previous = page;
  }
  return out;
}

const total = computed(() => props.meta?.totalPages || 0);
const current = computed(() => props.meta?.page || 1);
const pages = computed(() => pageWindow(current.value, total.value));

const href = (page) => (page === 1 ? props.basePath : `${props.basePath}?page=${page}`);

const arrow =
  "inline-flex h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-4 text-sm font-medium text-zinc-300 transition hover:border-white/30 hover:text-white";
</script>

<template>
  <nav v-if="total > 1" aria-label="Pagination" class="flex flex-wrap items-center justify-center gap-2">
    <RouterLink v-if="meta.hasPrevPage" :to="href(current - 1)" rel="prev" :class="arrow">
      ← Previous
    </RouterLink>
    <span v-else :class="[arrow, 'cursor-not-allowed opacity-40']">← Previous</span>

    <ul class="flex items-center gap-1.5">
      <template v-for="(page, index) in pages">
        <li v-if="page === null" :key="`gap-${index}`" class="px-1 text-zinc-600">…</li>
        <li v-else :key="page">
          <RouterLink
            :to="href(page)"
            :aria-current="page === current ? 'page' : undefined"
            class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition"
            :class="
              page === current
                ? 'bg-white text-zinc-950'
                : 'border border-white/12 bg-white/[0.04] text-zinc-300 hover:border-white/30 hover:text-white'
            "
          >
            {{ page }}
          </RouterLink>
        </li>
      </template>
    </ul>

    <RouterLink v-if="meta.hasNextPage" :to="href(current + 1)" rel="next" :class="arrow">
      Next →
    </RouterLink>
    <span v-else :class="[arrow, 'cursor-not-allowed opacity-40']">Next →</span>
  </nav>
</template>
