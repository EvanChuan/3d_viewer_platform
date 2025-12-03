import { defineConfig } from "vite";

export default defineConfig({
  base: '/3d_viewer_platform/', 
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
