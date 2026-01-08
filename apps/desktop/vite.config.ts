import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@mythica/core": path.resolve(__dirname, "../../packages/core/dist"),
      "@mythica/board": path.resolve(__dirname, "../../packages/board/dist"),
      "@mythica/storage": path.resolve(
        __dirname,
        "../../packages/storage/dist"
      ),
      "@mythica/net": path.resolve(__dirname, "../../packages/net/dist"),
    },
  },
});
