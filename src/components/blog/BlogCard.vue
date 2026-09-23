<script setup>
import { computed } from "vue";
import { formatDate, initials, readingTimeFor } from "@/lib/format";
/* One post in a grid. `featured` turns the card into a two-column hero card
   for the first post on a listing. */
const props = defineProps({
  post: { type: Object, required: true },
  featured: { type: Boolean, default: false },
  priority: { type: Boolean, default: false },
});

const date = computed(() => formatDate(props.post.publishedAt));
const reading = computed(() => readingTimeFor(props.post));
const author = computed(() => props.post.author);
</script>

<template>
  <article
    class="group relative isolate flex overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
    :class="featured ? 'flex-col lg:flex-row' : 'flex-col'"
  >
    <!-- Gradient hairline that lights up on hover. -->
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />

    <div
      class="relative overflow-hidden bg-zinc-900"
      :class="featured ? 'aspect-[16/10] lg:aspect-auto lg:w-[52%]' : 'aspect-[16/9]'"
    >
      <img
        v-if="post.coverImage"
        :src="post.coverImage"
        :alt="post.title"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      >
      <div v-else class="absolute inset-0 bg-[linear-gradient(135deg,#3b0764,#0e7490)]" />
      <span class="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

      <span
        v-if="post.category"
        class="absolute top-4 left-4 rounded-full border border-white/20 bg-zinc-950/60 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-100 uppercase backdrop-blur"
      >
        {{ post.category }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-6" :class="featured ? 'lg:justify-center lg:p-10' : ''">
      <h3
        class="font-semibold text-balance text-white"
        :class="featured ? 'text-2xl leading-tight sm:text-3xl' : 'text-lg leading-snug'"
      >
        <!-- The whole card is the link target via this stretched anchor, so the
             heading stays the single accessible name for the card. -->
        <RouterLink :to="`/blog/${post.slug}`" class="before:absolute before:inset-0 before:content-['']">
          {{ post.title }}
        </RouterLink>
      </h3>

      <p
        v-if="post.excerpt || post.description"
        class="mt-3 text-zinc-400"
        :class="featured ? 'text-base leading-relaxed' : 'line-clamp-3 text-sm leading-relaxed'"
      >
        {{ post.excerpt || post.description }}
      </p>

      <div class="mt-6 flex items-center gap-3 border-t border-white/10 pt-4 text-xs text-zinc-500">
        <img
          v-if="author?.image"
          :src="author.image"
          :alt="author.name || ''"
          width="28"
          height="28"
          loading="lazy"
          decoding="async"
          class="h-7 w-7 rounded-full object-cover ring-1 ring-white/15"
        >
        <span
          v-else
          class="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-zinc-200"
        >
          {{ initials(author?.name) }}
        </span>
        <span class="truncate font-medium text-zinc-300">{{ author?.name || "ContioReach" }}</span>
        <span v-if="date" class="text-zinc-600">•</span>
        <time v-if="date" :datetime="post.publishedAt">{{ date }}</time>
        <span v-if="reading" class="ml-auto shrink-0 text-zinc-500">{{ reading }}</span>
      </div>
    </div>
  </article>
</template>
