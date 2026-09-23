<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
/* Sticky contents rail. The headings are parsed on the server and handed in,
   so this only tracks which one is on screen. */
const props = defineProps({ items: { type: Array, default: () => [] } });

const activeId = ref(props.items[0]?.id || "");
let observer = null;

function observe() {
  observer?.disconnect();
  if (props.items.length === 0) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeId.value = entry.target.id;
      });
    },
    { rootMargin: "-20% 0% -35% 0%" },
  );

  props.items.forEach((item) => {
    const element = document.getElementById(item.id);
    if (element) observer.observe(element);
  });
}

onMounted(observe);
// A client-side navigation to another article swaps the headings under us.
watch(() => props.items, () => nextTick(observe));
onBeforeUnmount(() => observer?.disconnect());

function scrollTo(event, id) {
  event.preventDefault();
  const element = document.getElementById(id);
  if (!element) return;
  // Offset so the heading clears the sticky page header.
  const top = element.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: "smooth" });
  window.history.replaceState(null, "", `#${id}`);
}
</script>

<template>
  <nav
    v-if="items.length"
    aria-label="Table of contents"
    class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur"
  >
    <p class="mb-4 text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
      On this page
    </p>
    <ul class="max-h-[60vh] space-y-1 overflow-y-auto border-l border-white/10">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          class="-ml-px block border-l-2 py-1.5 pr-2 text-sm leading-snug transition"
          :class="
            activeId === item.id
              ? 'border-fuchsia-400 font-medium text-white'
              : 'border-transparent text-zinc-400 hover:border-white/30 hover:text-zinc-200'
          "
          :style="{ paddingLeft: `${14 + (item.level - 2) * 12}px` }"
          @click="scrollTo($event, item.id)"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>
