const express = require("express");
const router = express.Router();

const { createPaymentLink, getPayments } = require("../controllers/paymentController");

router.post("/", getPayments);
router.post("/create-link", createPaymentLink);

module.exports = router;