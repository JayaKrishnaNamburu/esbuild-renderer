import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: "es2021",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2021",
    },
  },
  plugins: [
    nodePolyfills(),
    react({
      babel: {
        plugins: [
          ["@babel/plugin-proposal-decorators", { version: "legacy" }],
          "@babel/plugin-proposal-class-properties",
        ],
      },
    }),
  ],
});
