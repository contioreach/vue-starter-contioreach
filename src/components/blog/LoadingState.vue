<script setup>
/* Shown while a route's data is in flight. Skeletons rather than a spinner, so
   the page does not visibly jump when the real content lands. */
defineProps({ variant: { type: String, default: "listing" } });
</script>

<template>
  <div v-if="variant === 'article'" aria-hidden="true" class="mx-auto max-w-4xl animate-pulse space-y-5 px-6 py-20">
    <div class="h-3 w-24 rounded bg-white/[0.06]"></div>
    <div class="h-10 w-4/5 rounded bg-white/[0.06]"></div>
    <div class="h-4 w-full rounded bg-white/[0.04]"></div>
    <div class="h-4 w-11/12 rounded bg-white/[0.04]"></div>
    <div class="mt-10 aspect-[16/8] rounded-3xl bg-white/[0.04]"></div>
  </div>

  <div v-else aria-hidden="true" class="grid animate-pulse gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="index in 6"
      :key="index"
      class="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
    >
      <div class="aspect-[16/9] bg-white/[0.04]"></div>
      <div class="space-y-3 p-6">
        <div class="h-4 w-3/4 rounded bg-white/[0.06]"></div>
        <div class="h-3 w-full rounded bg-white/[0.04]"></div>
        <div class="h-3 w-5/6 rounded bg-white/[0.04]"></div>
      </div>
    </div>
  </div>
</template>
