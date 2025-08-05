import nodemailer from 'nodemailer';
import dotenv from 'dotenv';




export const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "sk.crown.l0rd@gmail.com", // your email
      pass: "bpkf gcvq xrcm lbsg", // your app password
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: 'Verify your account',
    text: `Your verification code is: ${code}`,
  };

  await transporter.sendMail(mailOptions);
};
