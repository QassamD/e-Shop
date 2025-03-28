import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    open: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
});
