const nodemailer = require('nodemailer');

const sendEmail = async (toEmail, subject, text) => {
  try {
    // Create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail; you can change to another provider if needed
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.EMAIL_PASSWORD, // App-specific password
      },
      secure: true, // Ensures secure communication
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: toEmail, // Recipient's email
      subject: subject, // Email subject
      text: text, // Email body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}: ${info.response}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
  }
};

module.exports = sendEmail;
