

const schedule = require('node-schedule');
const sendEmail = require('../utils/email'); // Adjust the path to your email utility

// Function to send reminder emails
const sendReminderEmails = async () => {
  try {
    const subject = 'Reminder Email';
    const text = 'Hello, this is a reminder email for you.';
    const userEmail = 'bangeraananya1@gmail.com'; // The recipient's email

    if (!userEmail || !userEmail.includes('@')) {
       console.log(`Invalid email ${userEmail}. Skipping.`);
      return;
    }

    await sendEmail(userEmail, subject, text); // Send the email
    console.log(`Sent email to ${userEmail}`); // Log the success
  }catch (error) {
    console.error("Error sending reminder emails:", error.stack); // Log any errors
  }
};

// Schedule the task to run every minute
schedule.scheduleJob('* * * * *', () => {
  console.log('Scheduled job running...');
  sendReminderEmails();
});
