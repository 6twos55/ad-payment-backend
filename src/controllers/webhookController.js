const crypto = require("crypto");
const axios = require("axios");
const Payment = require("../models/Payment");

const paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // 1. Verify signature (VERY IMPORTANT)
    const hash = crypto
      .createHmac("sha512", secret)
      .update(req.rawBody)
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    // 2. Handle only successful payments
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // 3. Confirm transaction with Paystack (double security)
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${secret}`,
          },
        }
      );

      const paymentData = response.data.data;

      if (paymentData.status !== "success") {
        return res.status(400).send("Payment not successful");
      }

      // 4. Find payment in DB
      const payment = await Payment.findOne({
        paystackReference: reference,
      });

      if (!payment) {
        return res.status(404).send("Payment not found");
      }

      // 5. Prevent duplicate processing
      if (payment.status === "success") {
        return res.status(200).send("Already processed");
      }

      // 6. Update payment
      payment.status = "success";
      payment.paidAt = new Date();
      await payment.save();

      // 7. Trigger notifications
      console.log("Send email to customer + org here");

      // (we’ll implement email service next)

      return res.status(200).send("OK");
    }

    return res.status(200).send("Event ignored");
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(500).send("Server error");
  }
};

module.exports = {
  paystackWebhook,
};