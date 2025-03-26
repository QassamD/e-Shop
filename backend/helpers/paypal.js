const express = require("express");
const router = express.Router();

const paypal = require("@paypal/checkout-server-sdk");
const environment = new paypal.core.SandboxEnvironment(
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET"
);
const client = new paypal.core.PayPalHttpClient(environment);

router.post("/capture-paypal-payment", async (req, res) => {
  try {
    const { orderID } = req.body;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    const response = await client.execute(request);

    if (response.result.status === "COMPLETED") {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ error: "Payment not completed" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
