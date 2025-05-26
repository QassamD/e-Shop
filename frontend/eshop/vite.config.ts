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
      jsxRuntime: "automatic",
    }),
    legacy({
      targets: ["defaults", "not IE 11"],
    }),
  ],
  resolve: {
    alias: {
      "react/jsx-runtime": "react/jsx-runtime.js",
      "react-auth-kit": "react-auth-kit/dist/index.js",
      "react-auth-kit/hooks": "react-auth-kit/dist/hooks/index.js",
      "@": resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".mjs"],
  },
  server: {
    port: 5173,
    open: true,
    headers: {
      "Stripe-Account":
        "pk_test_51QyJT7E8IVJvL5F7Qj3A5D3TvxDFe0AxQkEB0bCVkxPtjKbnu4i8fBW3vGPmxagLdR0eMvQHsXv0zEjWqPeFmiDs00o7qY0WQ5",
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
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
      "/public": {
        target: "https://e-shop-lbbw.onrender.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: false,
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
      // commonjsOptions: {
      //   transformMixedEsModules: true,
      // },
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
