<script setup>
// Announced to assistive tech while a route's data loads.
defineProps({ loading: { type: Boolean, default: false } });
</script>

<template>
  <span role="status" aria-live="polite" class="sr-only">{{ loading ? "Loading" : "" }}</span>
</template>
