import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
  try {
    console.log("📧 Preparing to send email...");
    console.log("📧 To:", to);
    console.log("📧 Host:", process.env.MAILTRAP_SMTP_HOST);
    console.log("📧 Port:", process.env.MAILTRAP_SMTP_PORT);
    console.log(
      "📧 User configured:",
      !!process.env.MAILTRAP_SMTP_USER
    );
    console.log(
      "📧 Password configured:",
      !!process.env.MAILTRAP_SMTP_PASS
    );

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,

      port: Number(
        process.env.MAILTRAP_SMTP_PORT
      ),

      secure: false,

      auth: {
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS,
      },
    });

    // Test SMTP connection before sending
    await transporter.verify();

    console.log("✅ Mailtrap SMTP connection successful");

    const info = await transporter.sendMail({
      from: '"AI Ticket System" <no-reply@example.com>',
      to,
      subject,
      text,
    });

    console.log(
      "📧 Message sent:",
      info.messageId
    );

    return info;

  } catch (err) {
    console.error(
      "❌ Mail error:",
      err
    );

    throw err;
  }
};