// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Build assets to be served under the /shop/ subpath
  base: "/shop/",
  server: {
    host: "0.0.0.0", // Use 0.0.0.0 for cross-platform compatibility (Windows/containers)
    port: 8080,
    proxy: {
      "/products": { target: "http://localhost:3000", changeOrigin: true, secure: false },
      "/api": { target: "http://localhost:3000", changeOrigin: true, secure: false },
      "/images": { target: "http://localhost:3000", changeOrigin: true, secure: false },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
