// user.js
// Description: It is used to define the routes for the users.
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const morgan = require("morgan");
const { verifyAdmin, verifyToken } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

router.get("/", verifyToken, verifyAdmin, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) res.status(500).json({ success: false });
  res.send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user)
    res
      .status(500)
      .json({ massage: "tha user with the given ID was not found" });
  res.status(200).send(user);
});

router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();

  if (!user) {
    return res.status(404).send("the user cannot be created");
  }

  res.send(user);
});
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save();

  if (!user) {
    return res.status(404).send("the user cannot be created");
  }

  res.status(201).send(user);
});

router.post("/login", async (req, res) => {
  try {
    // 1. Input validation
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" }); // Generic message for security
    }

    // 3. Password comparison (async version)
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Token generation
    const jti = uuidv4();
    const secret = process.env.JWT_SECRET; // Ensure this is set in environment

    if (!secret) {
      throw new Error("JWT secret not configured");
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        isAdmin: user.isAdmin,
        jti: jti, // Remove circular 'token' reference
      },
      secret,
      { expiresIn: "7d" }
    );

    // 5. Store token in database
    await User.findByIdAndUpdate(user._id, {
      $push: {
        tokens: {
          jti: jti,
          revoked: false,
          createdAt: new Date(),
        },
      },
    });

    // 6. Response with security considerations
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token: token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/get/count", verifyToken, verifyAdmin, async (req, res) => {
  const userCount = await User.countDocuments({});
  if (!userCount) res.status(500).json({ success: false });
  res.send({
    count: userCount,
  });
});

router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, massage: "user is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, massage: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
