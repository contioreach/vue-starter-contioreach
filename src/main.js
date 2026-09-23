import { createApp, h, reactive, ref } from "vue";
import App from "./App.vue";
import BootError from "./components/layout/BootError.vue";
import { getConfig } from "./lib/api";
import { router } from "./router";
import { provideSite } from "./lib/site";
import "./styles/global.css";

/* The public configuration is fetched once before the app renders, so no
   component ever has to handle it being absent. It is a single same-origin
   request against a response the server marks cacheable.

   `site` is a reactive object rather than a ref, so components read plain
   properties — site.signupUrl — instead of unwrapping a ref everywhere. It is
   filled in before <App> first renders and never changes after. */
const site = reactive({});
const ready = ref(false);
const failed = ref(false);

const Root = {
  setup() {
    // provide() must run synchronously in setup; the object it hands down is
    // populated by the time anything reads it.
    provideSite(site);

    return () => {
      if (failed.value) return h(BootError);
      // A blank first paint rather than a spinner: the config request is local
      // and fast, and a flashed spinner would be noise.
      if (!ready.value) return null;
      return h(App);
    };
  },
};

getConfig()
  .then((config) => {
    Object.assign(site, config);
    ready.value = true;
  })
  .catch(() => {
    failed.value = true;
  });

createApp(Root).use(router).mount("#app");
