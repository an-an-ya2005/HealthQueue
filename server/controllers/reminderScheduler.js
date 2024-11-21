// const schedule = require('node-schedule');
// const moment = require('moment');
// const appointmentModel = require('../models/appointmentModel'); // Adjust the path as needed
// const sendEmail = require('../utils/email'); // Adjust the path to your email utility

// // Function to send reminder emails
// const sendReminderEmails = async () => {
//   try {
//     const currentTime = moment();
//     const fiveMinutesLater = moment().add(5, 'minutes');

//     const upcomingAppointments = await appointmentModel.find({
//       status: 'approved',
//       time: {
//         $gte: currentTime.toISOString(),
//         $lte: fiveMinutesLater.toISOString(),
//       },
//     });

//     console.log("Upcoming Appointments:", upcomingAppointments);

//     if (upcomingAppointments.length === 0) {
//       console.log("No upcoming appointments within the next 5 minutes.");
//       return;
//     }

//     for (let appointment of upcomingAppointments) {
//       const userEmail = appointment.userInfo.email;
//       const subject = `Appointment Reminder: ${appointment.doctorInfo.name}`;
//       const text = `Hello, this is a reminder for your appointment with Dr. ${appointment.doctorInfo.name} at ${moment(appointment.time).format('LLLL')}. Please be on time.`;

//       if (!userEmail || !userEmail.includes('@')) {
//         console.log(`Invalid email for appointment ${appointment._id}. Skipping.`);
//         continue;
//       }

//       await sendEmail(userEmail, subject, text);
//       console.log(`Sent email to ${userEmail}`);
//     }
//   } catch (error) {
//     console.error("Error sending reminder emails:", error.stack);
//   }
// };


// // Schedule the task to run every minute
// schedule.scheduleJob('* * * * *', sendReminderEmails);

const schedule = require('node-schedule');
const sendEmail = require('../utils/email'); // Adjust the path to your email utility

// Function to send reminder emails
const sendReminderEmails = async () => {
  try {
    const subject = 'Reminder Email';
    const text = 'Hello, this is a reminder email for you.';
    const userEmail = 'poojarinithin717@gmail.com'; // The recipient's email

    if (!userEmail || !userEmail.includes('@')) {
      console.log(`Invalid email ${userEmail}. Skipping.`);
      return;
    }

    await sendEmail(userEmail, subject, text); // Send the email
    console.log(`Sent email to ${userEmail}`); // Log the success
  } catch (error) {
    console.error("Error sending reminder emails:", error.stack); // Log any errors
  }
};

// Schedule the task to run every minute
schedule.scheduleJob('* * * * *', () => {
  console.log('Scheduled job running...');
  sendReminderEmails();
});
