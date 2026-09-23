<script setup>
import SiteFooter from "@/components/layout/SiteFooter.vue";
import SiteHeader from "@/components/layout/SiteHeader.vue";
</script>

<template>
  <SiteHeader />
  <main class="flex-1">
    <!-- `key` on the route path remounts a page when only its params change,
         so /blog/a -> /blog/b starts from a clean state rather than reusing
         the previous article's component instance. -->
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </main>
  <SiteFooter />
</template>
