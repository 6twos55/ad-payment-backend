require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./src/config/db");
const paymentRoutes = require("./src/routes/paymentRoutes");
const webhookRoutes = require("./src/routes/webhookRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith("/v1/paystack/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  }),
);
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/payments", paymentRoutes);
app.use("/api/webhook", webhookRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
