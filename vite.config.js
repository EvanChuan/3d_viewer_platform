import { defineConfig } from "vite";
import { resolve } from 'path'; // 如果你有用到多頁面配置

export default defineConfig({
  base: '/', // ✅ 絕對要設為根目錄
  build: {
    rollupOptions: {
        input: {
            main: resolve(__dirname, 'index.html'),
            // room2: resolve(__dirname, 'room2.html'), // 如果有的話
        }
    }
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
  },
});
