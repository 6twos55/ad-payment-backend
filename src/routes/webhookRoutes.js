const express = require("express");
const router = express.Router();

const { paystackWebhook } = require("../controllers/webhookController");

router.post("/paystack", paystackWebhook);

module.exports = router;