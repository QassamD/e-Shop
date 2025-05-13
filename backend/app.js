const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

const productsRouter = require("./routers/products");
const usersRouter = require("./routers/users");
const ordersRouter = require("./routers/orders");
const categoriesRouter = require("./routers/categories");
const paymentRouter = require("./helpers/payment");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

// Database connection

const port = 3000;

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database Connection is ready .....");

    // Start server AFTER successful connection
    app.listen(port, () => {
      console.log("Server is running http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });

// require("dotenv/config");
require("dotenv").config();
const api = process.env.API_URL;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://e-shop-lbbw.onrender.com",
      "https://gorgeous-youtiao-c51f0a.netlify.app/",
    ], // Allow both development ports
    methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

//middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);
// mongoose.set("debug", true);
// mongoose.set("strictQuery", true);

require("./models/category");
require("./models/user");
require("./models/product");
require("./models/order");
require("./models/order-item");

console.log(`API base path: ${api}`);

//Routes
app.use(`${api}/product`, productsRouter);
app.use(`${api}/user`, usersRouter);
app.use(`${api}/order`, ordersRouter);
app.use(`${api}/category`, categoriesRouter);
app.use(`${api}/`, paymentRouter);

app.get("/api/healthcheck", (req, res) => {
  res.status(200).json({ status: "Server is running!" });
});

// mongoose
//   .connect(process.env.CONNECTION_STRING, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Database Connection is ready .....");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// app.listen(3000, () => {
//   console.log("server is running http://localhost:3000");
// });
