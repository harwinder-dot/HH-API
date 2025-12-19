const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 1. Handle the browser handshake (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Only allow POST requests for emails
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { fullname, email, phone, country, message, type } = req.body;

  // Validate environment variables
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    return res.status(500).json({ 
      success: false, 
      error: 'Email configuration missing. Please set GMAIL_USER and GMAIL_PASS environment variables.' 
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS, // Must be an App Password, not regular password
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
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (errorMessage.includes('BadCredentials') || errorMessage.includes('535')) {
      errorMessage = 'Gmail authentication failed. Please ensure you are using an App Password (not your regular password). See setup instructions in the code comments.';
    }
    return res.status(500).json({ success: false, error: errorMessage });
  }
}