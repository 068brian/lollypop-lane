// File: api/enquiry.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Admin notification
    await transporter.sendMail({
      from: `Lollypop Lane <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Enquiry Received',
      html: `
        <h2>New Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Client auto-response
    await transporter.sendMail({
      from: `Lollypop Lane <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: 'Thanks for your enquiry!',
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for contacting <strong>Lollypop Lane</strong>! We’ve received your message:</p>
        <blockquote>${message.replace(/\n/g, '<br>')}</blockquote>
        <p>We’ll get back to you shortly.</p>
        <p>Kind regards,<br><strong>Lollypop Lane Team</strong></p>
      `,
    });

    return res.status(200).json({ message: 'Enquiry submitted successfully' });
  } catch (error) {
    console.error('Email sending failed:', error);
    return res.status(500).json({ message: 'Failed to send email' });
  }
}
