import { inject, provide } from "vue";

/* The public configuration, fetched once at startup from GET /api/config and
   provided from the root. It is served at runtime rather than baked into the
   bundle, so one build artifact runs in staging and production. */
const SITE = Symbol("site");

export function provideSite(site) {
  provide(SITE, site);
}

export function useSite() {
  const site = inject(SITE, null);
  if (!site) {
    throw new Error("useSite() must be called inside a component under provideSite()");
  }
  return site;
}
