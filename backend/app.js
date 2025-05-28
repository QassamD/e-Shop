require("dotenv").config(); // MUST BE AT THE TOP

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const helmet = require("helmet");

// Routes and middleware
const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orders");
const categoriesRouter = require("./routers/categories");
const paymentRouter = require("./helpers/payment");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

app.enable("trust proxy");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  secure: true,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Update CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://eshop010.netlify.app",
        "http://localhost:4173",
        "http://localhost:4174",
        "http://localhost:5173",
        "https://e-shop-lbbw.onrender.com",
      ];
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(
          new Error(
            "The CORS policy for this site does not allow access from the specified Origin."
          ),
          false
        );
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-auth-token",
      "Accept",
      "Origin",
      "X-Requested-With",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Add proxy trust
app.set("trust proxy", 1);

// Handle preflight requests
app.options("*", cors());

// Increase payload size limit for file uploads
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Middleware
app.use(morgan("tiny"));
app.use(authJwt());

// Add CSP middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://*.stripe.com",
        "https://*.paypal.com",
        "https://*.cloudinary.com",
        "https://res.cloudinary.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.stripe.com",
        "https://*.paypal.com",
        "https://*.cloudinary.com",
        "https://res.cloudinary.com",
      ],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://www.paypal.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: [
        "'self'",
        "https://checkout.stripe.com",
        "https://www.paypal.com",
      ],
    },
  })
);

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

    // Configure static file serving after api is defined
    app.use(
      `${api}/public/uploads`,
      express.static(path.join(__dirname, "public/uploads"))
    );

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
