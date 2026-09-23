<script setup>
defineProps({ author: { type: Object, default: null } });
</script>

<template>
  <div v-if="author" class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
    <p class="mb-4 text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
      Written by
    </p>
    <div class="flex items-start gap-3.5">
      <img
        v-if="author.image"
        :src="author.image"
        :alt="author.name || ''"
        width="48"
        height="48"
        loading="lazy"
        decoding="async"
        class="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/15"
      >
      <span
        v-else
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-zinc-200"
      >
        {{ initials(author.name) }}
      </span>
      <div class="min-w-0">
        <p class="font-semibold text-white">{{ author.name }}</p>
        <p v-if="author.bio" class="mt-1.5 text-sm leading-relaxed text-zinc-400">{{ author.bio }}</p>
        <div v-if="author.twitter || author.website" class="mt-3 flex gap-4 text-xs font-medium">
          <a
            v-if="author.twitter"
            :href="author.twitter"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="text-zinc-300 underline-offset-4 hover:underline"
          >
            Twitter
          </a>
          <a
            v-if="author.website"
            :href="author.website"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="text-zinc-300 underline-offset-4 hover:underline"
          >
            Website
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
