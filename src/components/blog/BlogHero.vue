<script setup>
import Aurora from "./Aurora.vue";
import Eyebrow from "./Eyebrow.vue";
defineProps({
  eyebrow: { type: String, default: "The ContioReach blog" },
  paragraph: { type: String, default: "" },
  stat: { type: String, default: null },
});
</script>

<template>
  <section class="relative overflow-hidden border-b border-white/10">
    <Aurora />
    <div class="relative mx-auto max-w-4xl px-6 pt-20 pb-14 text-center sm:pt-28 sm:pb-20">
      <Eyebrow>{{ eyebrow }}</Eyebrow>

      <h1 class="mt-6 text-4xl leading-[1.05] font-semibold text-balance text-white sm:text-6xl">
        <slot name="heading" />
      </h1>

      <p v-if="paragraph" class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-zinc-400">
        {{ paragraph }}
      </p>

      <p v-if="stat" class="mt-6 text-sm text-zinc-500">{{ stat }}</p>
    </div>
  </section>
</template>
