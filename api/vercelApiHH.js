const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  // 1. Handle the browser handshake (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Only allow POST requests for emails
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { fullname, email, phone, country, message, type } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `[${type}] New Lead: ${fullname}`,
      text: `Name: ${fullname}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}\nMessage: ${message}`
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}