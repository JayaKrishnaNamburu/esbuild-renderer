import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
  },
  optimizeDeps: {
    exclude: ["@swc/wasm-web"],
    esbuildOptions: {
      target: "es2020",
    },
  },
});
