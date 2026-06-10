const express = require("express");
const { saveMessage } = require("../db/messages");
const { sendContactEmail } = require("../utils/mailer");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const name = (req.body.user_name || req.body.name || "").trim();
    const email = (req.body.user_email || req.body.email || "").trim();
    const message = (req.body.message || "").trim();

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const saved = await saveMessage({ name, email, message });
    const mailResult = await sendContactEmail({ name, email, message });

    res.status(201).json({
      message: mailResult.sent
        ? "Message sent successfully! Riya will get back to you soon."
        : "Message received successfully! Riya will get back to you soon.",
      saved: true,
      emailed: mailResult.sent
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});

module.exports = router;
