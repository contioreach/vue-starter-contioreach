import { useHead } from "./useHead";
import { useSite } from "./site";

/* Turns the same arguments every other example in this set uses into the tag
   list useHead() manages. Called with a getter so it re-runs when the route's
   data arrives. */
export function useSeo(source) {
  const site = useSite();

  useHead(() => {
    const {
      title,
      description,
      path = "/",
      image,
      alt,
      type = "website",
      keywords = [],
      noIndex = false,
      publishedTime,
      modifiedTime,
      jsonLd = [],
    } = source() || {};

    if (!title) return {};

    const url = `${site.siteUrl}${path}`;
    const ogImage = image || `${site.siteUrl}/og-default.png`;
    /* Site-wide noindex while PUBLIC_ALLOW_INDEXING is off; individual pages
       (a missing post, say) can still opt out on their own. */
    const blocked = noIndex || site.noIndex;
    const keywordList = keywords.filter(Boolean).join(", ");

    return {
      title,
      link: [{ rel: "canonical", href: url }],
      meta: [
        { name: "description", content: description },
        keywordList ? { name: "keywords", content: keywordList } : null,
        { name: "robots", content: blocked ? "noindex, nofollow" : "index, follow" },

        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: type },
        { property: "og:site_name", content: "ContioReach" },
        { property: "og:image", content: ogImage },
        { property: "og:image:alt", content: alt || title },
        publishedTime ? { property: "article:published_time", content: publishedTime } : null,
        modifiedTime ? { property: "article:modified_time", content: modifiedTime } : null,

        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ].filter(Boolean),
      jsonLd,
    };
  });
}
