import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1. Ek Transporter create karo (Yeh email bhejney wala engine hai)
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  // 2. Email ke options define karo
  const mailOptions = {
    // 👇 FIX: Ab yeh direct tumhari .env file se uthayega
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER, 
    to: options.email,
    subject: options.subject,
    html: options.message, // HTML format support karne ke liye
  };

  // 3. Email Send karo
  await transporter.sendMail(mailOptions);
};

export default sendEmail;