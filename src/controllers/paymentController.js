const axios = require("axios");
const Payment = require("../models/Payment");
const { sendPaymentLinkEmail } = require("../services/emailService");

const createPaymentLink = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,

      category,
      format,
      size,
      description,

      amount,

      createdByEmail,
    } = req.body;

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !category ||
      !format ||
      !size ||
      !amount ||
      !createdByEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Initialize Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: customerEmail,
        amount: amount * 100,

        // enable if you want to show custom success page after payment
        // callback_url: process.env.PAYMENT_SUCCESS_URL,

        metadata: {
          customerName,
          customerPhone,

          category,
          format,
          size,
          description,

          createdByEmail,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const { authorization_url, reference } = response.data.data;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const payment = await Payment.create({
      customerName,
      customerEmail,
      customerPhone,

      category,
      format,
      size,
      description,

      amount,

      createdByEmail,

      paystackReference: reference,

      paymentLink: authorization_url,

      status: "pending",
      expiresAt,
    });

    // send mail to user
    try {
      await sendPaymentLinkEmail({
        customerName,
        customerEmail,

        category,
        format,
        size,
        description,

        amount,

        paymentLink: authorization_url,
      });
    } catch (emailError) {
      console.error("Payment link email failed:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Payment link created and emailed",

      paymentId: payment._id,

      reference,

      paymentLink: authorization_url,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment link",
    });
  }
};

const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
    } = req.query;

    const query = {};

    // Filter by status (optional)
    if (status) {
      query.status = status;
    }

    // Search by email or reference
    if (search) {
      query.$or = [
        { customerEmail: { $regex: search, $options: "i" } },
        { paystackReference: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: payments,

      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};


module.exports = {
  createPaymentLink,
  getPayments,
};
