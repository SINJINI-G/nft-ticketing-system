const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const QRCode = require("qrcode");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-ticket", async (req, res) => {
  const { email, tokenId, eventName, eventDate } = req.body;

  try {
    const qrData = `TICKET:${tokenId}`;
    const qrImage = await QRCode.toDataURL(qrData);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nfteventticketing@gmail.com",
        pass: "jdse eqdp xjrh vwkr"
      }
    });

    await transporter.sendMail({
      from: "nfteventticketing@gmail.com",
      to: email,
      subject: "Your Ticket",
      html: `
  <div style="
    max-width: 500px;
    margin: auto;
    font-family: Arial, sans-serif;
    border-radius: 20px;
    overflow: hidden;
    border: 2px solid #eee;
  ">

    <!-- Header -->
    <div style="
      background: #4f46e5;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    ">
      🎟️ Event Ticket
    </div>

    <!-- Body -->
    <div style="padding: 20px; text-align: center;">

      <h2 style="margin-bottom: 10px;">${eventName}</h2>
      <p style="color: #666; margin-bottom: 20px;">
        📅 ${eventDate}
      </p>

      <div style="
        background: #f9fafb;
        padding: 15px;
        border-radius: 12px;
        display: inline-block;
      ">
        <img src="cid:qrimage" width="200" />
      </div>

    </div>

    <!-- Footer -->
    <div style="
      background: #f3f4f6;
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #666;
    ">
      Show this QR code at entry
    </div>
  </div>
`,
    attachments: [
    {
      filename: "qr.png",
      path: qrImage,
      cid: "qrimage"
    }
  ]
    });

    res.send("Email sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending email");
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));