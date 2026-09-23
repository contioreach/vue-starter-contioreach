<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
/* Thin gradient bar pinned to the top of the article page. */
const progress = ref(0);

function update() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
}

onMounted(() => {
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", update);
  window.removeEventListener("resize", update);
});
</script>

<template>
  <div aria-hidden="true" class="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
    <div
      class="h-full origin-left bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400 transition-transform duration-150"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>
