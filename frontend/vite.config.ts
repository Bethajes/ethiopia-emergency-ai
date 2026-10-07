import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// The dev server proxies /api to the FastAPI backend so the browser only ever
// talks to one origin. In Docker the backend is reachable as http://backend:8001.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiTarget = env.VITE_DEV_API_TARGET ?? "http://localhost:8001";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT ?? 5173),
      strictPort: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: true,
      port: Number(env.VITE_DEV_PORT ?? 5173),
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      rollupOptions: {
        output: {
          // MapLibre dominates the bundle; splitting it keeps app updates cheap.
          manualChunks: {
            maplibre: ["maplibre-gl"],
            react: ["react", "react-dom", "react-router-dom"],
          },
        },
      },
    },
  };
});