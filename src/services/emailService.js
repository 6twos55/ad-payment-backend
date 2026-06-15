const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (transporter) {
  transporter
    .verify()
    .then(() => console.log("Connected to SMTP SERVER"))
    .catch((error) => console.error("Failed to connect to SMTP SERVER", error));
}

const sendPaymentLinkEmail = async ({
  customerName,
  customerEmail,

  category,
  format,
  size,
  description,

  amount,

  paymentLink,
}) => {
  await transporter.sendMail({
    from: `"Advertisement Team" <${process.env.ADS_EMAIL}>`,
    to: customerEmail,
    subject: "Complete Your Advertisement Payment",

    html: `
      <h2>Advertisement Payment Request</h2>

      <p>Hello ${customerName},</p>

      <p>
        Your advertisement request has been reviewed and approved.
      </p>

      <h3>Advertisement Details</h3>

      <ul>
        <li><strong>Category:</strong> ${category}</li>
        <li><strong>Format:</strong> ${format}</li>
        <li><strong>Size:</strong> ${size}</li>
        ${
          description
            ? `<li><strong>Description:</strong> ${description}</li>`
            : ""
        }
      </ul>

      <p>
        <strong>Amount:</strong> ₦${amount.toLocaleString()}
      </p>

      <p>
        Click the button below to complete payment:
      </p>

      <p>
        <a
          href="${paymentLink}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#0f766e;
            color:#fff;
            text-decoration:none;
            border-radius:4px;
          "
        >
          Complete Payment
        </a>
      </p>

      <p>
        If the button doesn't work, copy and paste this link:
      </p>

      <p>${paymentLink}</p>
    `,
  });
};

const sendCustomerEmail = async ({
  customerName,
  customerEmail,

  category,
  format,
  size,
  description,

  amount,
  reference,
}) => {
  await transporter.sendMail({
    from: `"Advertisement Team" <${process.env.ADS_EMAIL}>`,
    to: customerEmail,
    subject: "Payment Successful",

    html: `
      <h2>Payment Successful</h2>

      <p>Hello ${customerName},</p>

      <p>
        Your advertisement payment has been received successfully.
      </p>

      <h3>Advertisement Details</h3>

      <ul>
        <li><strong>Category:</strong> ${category}</li>
        <li><strong>Format:</strong> ${format}</li>
        <li><strong>Size:</strong> ${size}</li>
        ${
          description
            ? `<li><strong>Description:</strong> ${description}</li>`
            : ""
        }
      </ul>

      <p>
        <strong>Amount Paid:</strong>
        ₦${amount.toLocaleString()}
      </p>

      <p>
        <strong>Reference:</strong>
        ${reference}
      </p>

      <p>
        Our team will contact you shortly regarding your advertisement.
      </p>
    `,
  });
};

const sendOrganizationEmail = async ({
  customerName,
  customerEmail,
  customerPhone,

  category,
  format,
  size,
  description,

  amount,

  reference,

  createdByEmail,
}) => {
  await transporter.sendMail({
    from: `"Advertisement System" <${process.env.EMAIL_USER}>`,
    to: process.env.NOTIFICATION_EMAIL,

    subject: "New Advertisement Payment Received",

    html: `
      <h2>New Advertisement Payment Received</h2>

      <h3>Customer Information</h3>

      <p><strong>Name:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>

      <h3>Advertisement Details</h3>

      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Format:</strong> ${format}</p>
      <p><strong>Size:</strong> ${size}</p>

      ${
        description ? `<p><strong>Description:</strong> ${description}</p>` : ""
      }

      <p>
        <strong>Amount Paid:</strong>
        ₦${amount.toLocaleString()}
      </p>

      <p>
        <strong>Reference:</strong>
        ${reference}
      </p>

      <p>
        <strong>Created By:</strong>
        ${createdByEmail}
      </p>
    `,
  });
};

module.exports = {
  sendPaymentLinkEmail,
  sendCustomerEmail,
  sendOrganizationEmail,
};
