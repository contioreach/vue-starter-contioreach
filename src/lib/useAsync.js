import { onScopeDispose, ref, shallowRef, watch } from "vue";

/* The one data-fetching primitive in this app. A framework would hand you
   this; in a plain Vue SPA it is about forty lines, and writing it out is more
   honest than pulling in a query library for four call sites.

   It tracks loading and error state, reruns when its sources change, and
   ignores the result of a request that has been superseded — so navigating
   quickly between two posts can never render the slower one's response over
   the newer one.

   @param loader  () => Promise<any>
   @param sources reactive sources to watch; omit for a one-shot load
*/
export function useAsync(loader, sources = []) {
  const data = shallowRef(null);
  const error = shallowRef(null);
  const loading = ref(true);

  /* Incremented on every run; a resolved promise whose id no longer matches
     belongs to a navigation the user has already left behind. */
  let runId = 0;

  function run() {
    const id = ++runId;
    loading.value = true;
    error.value = null;

    loader()
      .then((result) => {
        if (id !== runId) return;
        data.value = result;
        loading.value = false;
      })
      .catch((cause) => {
        if (id !== runId) return;
        data.value = null;
        error.value = cause;
        loading.value = false;
      });
  }

  run();

  if (sources.length > 0) {
    watch(sources, run);
  }

  // Leaving the component invalidates anything still in flight.
  onScopeDispose(() => {
    runId += 1;
  });

  return { data, error, loading };
}
