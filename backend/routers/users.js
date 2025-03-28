// user.js
// Description: It is used to define the routes for the users.
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");
const { verifyAdmin, verifyToken } = require("../middleware/auth");
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
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;

  if (!user) {
    return res.status(400).send("the user not found");
  }
  // console.log(user);

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const jti = uuidv4();

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        isAdmin: user.isAdmin,
        jti: jti,

        // email: user.email,
        // name: user.name,
        // token: "token",
      },
      secret,
      { expiresIn: "7d" }
    );

    await User.findByIdAndUpdate(user._id, {
      $push: {
        tokens: {
          token: jti,
          revoked: false,
          createdAt: new Date(),
        },
      },
    });

    res.status(200).send({
      name: user.name,
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      token: token,

      // user: user.email,
    });
  } else {
    return res.status(400).send("password is wrong");
  }

  // return res.status(200).send(user);
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
