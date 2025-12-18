// api/send.js
const nodemailer = require("nodemailer");

export default async function handler(req, res) {
  // 1. SET CORS HEADERS (Allows your HTML to talk to this API from anywhere)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle browser "Pre-flight" check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { fullname, email, phone, country, message, type } = req.body;

  // 2. CONFIGURE GMAIL TRANSPORTER
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    // 3. SEND THE EMAIL
    await transporter.sendMail({
      from: `"${fullname}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `[${type}] New Lead: ${fullname}`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #b49b78;">New Website Inquiry</h2>
          <p><strong>Submission Type:</strong> ${type}</p>
          <hr>
          <p><strong>Full Name:</strong> ${fullname}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 10px; border-radius: 5px;">${message || "No message provided."}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Nodemailer Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}