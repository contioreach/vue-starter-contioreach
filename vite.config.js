import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), vue()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "#shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },

  build: {
    // The API server serves this directory in production.
    outDir: "dist/client",
    emptyOutDir: true,
  },

  server: {
    /* In development the client runs on Vite's port and the API server on its
       own; this proxy makes them one origin, so the app code never needs to
       know the difference between dev and production. */
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
