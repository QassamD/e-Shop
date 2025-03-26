// helpers/jwt.js
const { expressjwt } = require("express-jwt");
const { checkTokenInDatabase } = require("./tokenVerification");

function authJwt() {
  const secret = process.env.secret;
  // const api = process.env.API_URL;
  return expressjwt({
    secret,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
    credentialsRequired: false,
  }).unless({
    path: [
      { url: /\/public\/uploads(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/product(.*)/, methods: ["GET", "OPTIONS"] },
      { url: /\/api\/v1\/category(.*)/, methods: ["GET", "OPTIONS"] },
      {
        url: /\/api\/v1\/create-stripe-payment-intent(.*)/,
        methods: ["POST", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/create-paypal-order(.*)/,
        methods: ["POST", "OPTIONS"],
      },
      {
        url: /\/api\/v1\/capture-paypal-order(.*)/,
        methods: ["POST", "OPTIONS"],
      },
      { url: /\/api\/v1\/stripe-webhook(.*)/, methods: ["POST", "OPTIONS"] },
      { url: /\/api\/v1\/user\/login/, methods: ["POST"] },
      { url: /\/api\/v1\/user\/register/, methods: ["POST"] },
    ],
  });
}

async function isRevoked(req, token) {
  // try {
  //   // Check if token exists in database and isn't revoked
  //   const user = await User.findOne({ "tokens.token": token.token });
  //   if (!user) return true;

  //   const tokenRecord = user.tokens.find((t) => t.token === token.token);
  //   return tokenRecord?.revoked || false;
  // } catch (error) {
  //   console.error("Token revocation check failed:", error);
  //   return true;
  // }
  const isTokenRevoked = await checkTokenInDatabase(token.jti);
  return isTokenRevoked;
  // if (!token.payload.isAdmin) {
  //   return true; // ❌ Reject access if not admin
  // }
  // return false; // ✅ Allow access
}

module.exports = authJwt;
