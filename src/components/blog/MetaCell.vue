<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: "" },
});
</script>

<template>
  <div>
    <p class="text-[11px] tracking-wide text-zinc-500 uppercase">{{ label }}</p>
    <p class="mt-0.5 text-sm font-medium text-zinc-200">{{ value }}</p>
  </div>
</template>
