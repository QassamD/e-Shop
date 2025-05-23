import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ["@babel/plugin-transform-react-jsx", { runtime: "automatic" }],
        ],
      },
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"],
  },
  server: {
    port: 5173,
    open: true,
    headers: {
      "Content-Security-Policy": [
        "default-src 'self' https://*.stripe.com https://*.paypal.com https://www.sandbox.paypal.com https://e-shop-lbbw.onrender.com http://localhost:3000",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.stripe.com https://*.paypal.com https://www.sandbox.paypal.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.stripe.com https://*.paypal.com http://localhost:3000 https://e-shop-lbbw.onrender.com",
        "connect-src 'self' https://*.stripe.com https://*.paypal.com https://www.sandbox.paypal.com https://e-shop-lbbw.onrender.com http://localhost:3000",
        "frame-src 'self' https://*.stripe.com https://*.paypal.com https://www.sandbox.paypal.com",
        "worker-src 'self' blob:",
        "child-src 'self' blob:",
        "media-src 'self' blob:",
      ].join("; "),
    },
    proxy: {
      "/api": {
        target: "https://e-shop-lbbw.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/public": {
        target: "https://e-shop-lbbw.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/public/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    target: "es2020",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        format: "es",
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  base: "/",
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@stripe/stripe-js"],
    esbuildOptions: {
      target: "es2020",
      jsx: "automatic",
    },
  },
});
