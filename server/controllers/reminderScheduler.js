const schedule = require('node-schedule');
const moment = require('moment');
const appointmentModel = require('../models/appointmentModel'); // Adjust the path as needed
const sendEmail = require('../utils/email'); // Adjust the path to your email utility

// Function to send reminder emails
const sendReminderEmails = async () => {
  try {
    const currentTime = moment();
    const fiveMinutesLater = moment().add(5, 'minutes');

    // Query appointments in the next 5 minutes with approved status
    const upcomingAppointments = await appointmentModel.find({
      status: 'approved',
      time: {
        $gte: currentTime.toISOString(),
        $lte: fiveMinutesLater.toISOString(),
      },
    });

    console.log(upcomingAppointments);

    if (upcomingAppointments.length === 0) {
      console.log("No upcoming appointments within the next 5 minutes.");
      return;
    }

    // Send reminder emails
    for (let appointment of upcomingAppointments) {
      const userEmail = appointment.userInfo.email;
      const subject = `Appointment Reminder: ${appointment.doctorInfo.name}`;
      const text = `Hello, this is a reminder for your appointment with Dr. ${appointment.doctorInfo.name} at ${moment(appointment.time).format('LLLL')}. Please be on time.`;

      // Check if the email is valid
      if (!userEmail || !userEmail.includes('@')) {
        console.log(`Invalid email for appointment ${appointment._id}. Skipping.`);
        continue;
      }

      await sendEmail(userEmail, subject, text);
      console.log(`Sent email to ${userEmail}`);
    }
  } catch (error) {
    console.error("Error sending reminder emails:", error.stack);
  }
};


// Schedule the task to run every minute
schedule.scheduleJob('* * * * *', sendReminderEmails);