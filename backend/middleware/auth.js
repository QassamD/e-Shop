// auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];
  // console.log("Token: 14", token);

  jwt.verify(token, process.env.secret, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Forbidden - Invalid token" });
    }

    req.user = {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin,
    };

    next();
  });
};

const verifyAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({
      message: "Forbidden - Requires admin privileges",
    });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
