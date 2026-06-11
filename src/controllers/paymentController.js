const axios = require("axios");
const Payment = require("../models/Payment");
const AdPackage = require("../models/AdPackage");

const initializePayment = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, packageId } = req.body;

    if (!customerEmail || !packageId) {
      return res.status(400).json({
        message: "Email and package are required",
      });
    }

    // 1. Get package
    const adPackage = await AdPackage.findById(packageId);

    if (!adPackage) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // 2. Create Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: customerEmail,
        amount: adPackage.price * 100, // kobo
        metadata: {
          customerName,
          customerPhone,
          packageId: adPackage._id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    // 3. Save pending payment
    await Payment.create({
      customerName,
      customerEmail,
      customerPhone,
      package: adPackage._id,
      amount: adPackage.price,
      paystackReference: reference,
      status: "pending",
    });

    // 4. Send checkout URL to frontend
    return res.status(200).json({
      authorization_url,
      reference,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      message: "Payment initialization failed",
    });
  }
};

module.exports = {
  initializePayment,
};