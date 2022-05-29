import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "querykit",
      fileName: "index",
      formats: ["esm", "cjs", "umd"],
    },
    rollupOptions: {
      external: ["vue", "vue-demi"],
      output: {
        globals: {
          vue: "Vue",
          "vue-demi": "VueDemi",
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["vue-demi"],
  },
  plugins: [vue()],
});
