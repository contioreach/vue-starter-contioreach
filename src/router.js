import { createRouter, createWebHistory } from "vue-router";
import BlogPostPage from "@/pages/BlogPostPage.vue";
import CategoryPage from "@/pages/CategoryPage.vue";
import HomePage from "@/pages/HomePage.vue";
import ListingPage from "@/pages/ListingPage.vue";
import NotFoundPage from "@/pages/NotFoundPage.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/blog", component: ListingPage },
    { path: "/blog/category/:slug", component: CategoryPage },
    { path: "/blog/:slug", component: BlogPostPage },
    { path: "/:pathMatch(.*)*", component: NotFoundPage },
  ],

  /* A browser restores scroll on a real navigation; a SPA has to do it itself,
     or every new page opens halfway down where the last one was left. An
     in-page anchor is left alone — the table of contents handles its own
     scrolling with an offset for the sticky header. */
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) return false;
    return savedPosition || { top: 0 };
  },
});
