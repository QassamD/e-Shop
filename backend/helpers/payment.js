require("dotenv").config();
const express = require("express");
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Configure PayPal SDK
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// PayPal Routes
router.post("/create-paypal-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency || "USD",
            value: (amount / 100).toFixed(2),
          },
        },
      ],
    });

    const order = await paypalClient.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/capture-paypal-order", async (req, res) => {
  try {
    const { orderID } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);

    const capture = await paypalClient.execute(request);
    res.status(200).json({ status: capture.result.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== Stripe Routes ==========
router.post("/create-stripe-payment-intent", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || "usd",
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET // Use environment variable
      );

      switch (event.type) {
        case "payment_intent.succeeded":
          // Handle successful payment
          const paymentIntent = event.data.object;
          console.log(`Payment succeeded: ${paymentIntent.id}`);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

module.exports = router;
