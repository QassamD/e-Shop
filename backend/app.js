require("dotenv").config(); // MUST BE AT THE TOP

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

// Routes and middleware
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orders");
const categoriesRouter = require("./routers/categories");
const paymentRouter = require("./helpers/payment");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

// CORS Configuration (BEFORE other middleware)
app.use(
  cors({
    origin: [
      "http://localhost:4173",
      "https://gorgeous-youtiao-c51f0a.netlify.app",
      "http://localhost:4174",
      "http://localhost:5173",
      "https://e-shop-lbbw.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// Middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static((__dirname, "public/uploads")));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "img-src 'self' data: https://*.stripe.com https://*.paypal.com https://your-production-api-domain.com"
  );
  next();
});

app.use(errorHandler);

// Database connection (SINGLE CONNECTION)
mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database Connected");

    // Load models
    require("./models/category");
    require("./models/user");
    require("./models/product");
    require("./models/order");
    require("./models/order-item");

    // Routes
    const api = process.env.API_URL || "/api/v1"; // Fallback value
    app.use(`${api}/products`, productsRouter);
    app.use(`${api}/users`, usersRouter);
    app.use(`${api}/orders`, ordersRouter);
    app.use(`${api}/categories`, categoriesRouter);
    app.use(`${api}/payments`, paymentRouter);

    // Health check endpoint
    app.get("/api/healthcheck", (req, res) => {
      res.status(200).json({ status: "OK" });
    });

    // Server start (WITH PROPER CONFIG)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0", () => {
      // ✅ Correct IP format
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Connection Failed:", err);
    process.exit(1);
  });
