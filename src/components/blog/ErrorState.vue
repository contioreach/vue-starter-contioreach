<script setup>
defineProps({ title: { type: String, default: "Something went wrong" } });
</script>

<template>
  <div
    class="mx-auto max-w-lg rounded-3xl border border-dashed border-white/15 bg-white/[0.02] px-8 py-16 text-center"
  >
    <p class="text-lg font-medium text-white">{{ title }}</p>
    <p class="mt-2 text-sm text-zinc-400">
      <slot>The content could not be loaded. Try again in a moment.</slot>
    </p>
  </div>
</template>
