import nodemailer from 'nodemailer';
import dns from 'dns'; // 👈 NEW: DNS module import kiya

// 👇 FIX: Node.js ko force karo ki wo sirf IPv4 use kare (Render ke IPv6 issue ko fix karne ke liye)
dns.setDefaultResultOrder('ipv4first');

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1. Ek Transporter create karo
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // 👈 'service: gmail' ki jagah explicitly host daala hai
    port: 465,              // 👈 Secure port
    secure: true,           // 👈 True for 465 port
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // 2. Email ke options define karo
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER, 
    to: options.email,
    subject: options.subject,
    html: options.message, 
  };

  // 3. Email Send karo
  await transporter.sendMail(mailOptions);
};

export default sendEmail;