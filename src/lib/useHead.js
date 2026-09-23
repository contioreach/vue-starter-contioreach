import { onScopeDispose, watchEffect } from "vue";

/* Vue has no built-in head management — React 19 hoists <title> and <meta> out
   of a component for free, and Vue does not. Rather than add a head library
   for one job, this does it directly: about forty lines, with the two things
   a naive version gets wrong.

   1. Tags are keyed and reused, not appended. Navigating between ten posts
      must not leave ten og:title tags in the head.
   2. Tags this app created are marked, so cleanup never removes the ones the
      server injected into index.html for the initial route.

   The head a *crawler* sees on first byte is written by the server before the
   document is sent — see server/seo.js. This keeps it correct afterwards, as
   the user navigates. Both exist, and they agree. */

const OWNED = "data-head";

function upsert(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement(attributes.tag);
    element.setAttribute(OWNED, "");
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attributes)) {
    if (key === "tag") continue;
    if (value == null) element.removeAttribute(key);
    else element.setAttribute(key, String(value));
  }

  return element;
}

/** @param source () => ({ title, meta: [...], link: [...], jsonLd: [...] }) */
export function useHead(source) {
  watchEffect(() => {
    const { title, meta = [], link = [], jsonLd = [] } = source() || {};

    if (title) document.title = title;

    for (const entry of meta) {
      if (!entry) continue;
      const key = entry.name ? `meta[name="${entry.name}"]` : `meta[property="${entry.property}"]`;
      upsert(key, { tag: "meta", ...entry });
    }

    for (const entry of link) {
      if (!entry) continue;
      upsert(`link[rel="${entry.rel}"]`, { tag: "link", ...entry });
    }

    /* JSON-LD blocks are replaced wholesale: there can be several and they
       have no natural key, so the app's own are cleared and rewritten. */
    for (const script of document.head.querySelectorAll(
      `script[type="application/ld+json"][${OWNED}]`,
    )) {
      script.remove();
    }

    for (const block of jsonLd) {
      if (!block) continue;
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(OWNED, "");
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
    }
  });

  onScopeDispose(() => {
    for (const script of document.head.querySelectorAll(
      `script[type="application/ld+json"][${OWNED}]`,
    )) {
      script.remove();
    }
  });
}
