import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "app"),
      "@pages": path.resolve(__dirname, "pages"),
      "@widgets": path.resolve(__dirname, "widgets"),
      "@features": path.resolve(__dirname, "features"),
      "@entities": path.resolve(__dirname, "entities"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  server: {
    host: true,
    port: 3000,
  },
});
