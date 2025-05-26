const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:4173", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Proxy middleware configuration
const proxyOptions = {
  target: "https://e-shop-lbbw.onrender.com",
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    "^/api": "/api",
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log("Proxying request:", req.method, req.url);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log("Received response:", proxyRes.statusCode, req.url);
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error occurred" });
  },
};

// Use proxy for all /api routes
app.use("/api", createProxyMiddleware(proxyOptions));

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
