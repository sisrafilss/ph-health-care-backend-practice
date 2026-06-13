import nodemailer from "nodemailer";
import config from "../../../config";

const emailSender = async (email: string, html: string) => {
  // Create a transporter using SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use true for port 465, false for port 587
    auth: {
      user: config.smtp.smtp_user, // Your full Gmail address
      pass: config.smtp.smtp_pass, // Your App Password (NOT your login password)
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"PH Healtcare Practice" <team@example.com>', // sender address
      to: email, // list of recipients
      subject: "Reset Password Link", // subject line
      // text: "Hello world?", // plain text body
      html: html, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
};

export default emailSender;
