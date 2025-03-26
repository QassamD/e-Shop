// helpers/tokenVerification.js
const { User } = require("../models/user");

const checkTokenInDatabase = async (jti) => {
  try {
    const user = await User.findOne({ "tokens.token": jti });

    if (!user) return true; // Token doesn't exist
    const tokenRecord = user.tokens.find((t) => t.token === jti);

    return !!tokenRecord?.revoked;
  } catch (error) {
    console.error("Token verification error:", error);
    return true; // Deny access on error
  }
};

module.exports = { checkTokenInDatabase };
