const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: true,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: toEmail,
      subject: subject,
      html: htmlContent, // Replaced text with html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
