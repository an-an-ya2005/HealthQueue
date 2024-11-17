const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

// Register Controller
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller Error: ${error.message}`,
    });
  }
};

// CheckLoggedInDoctor
const checkDoctorLoginStatusController = async (req, res) => {
  try {
    const userId = req.body.userId; // Get userId from the request body
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({ message: "User  not found", success: false });
    }

    if (!user.isDoctor) {
      return res.status(403).send({ message: "Access Denied: Not a Doctor", success: false });
    }

    // If the user is a doctor, respond with success
    res.status(200).send({
      success: true,
      message: "Doctor is logged in",
      data: {
        name: user.name,
        email: user.email,
        isDoctor: user.isDoctor,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      message: "Error checking doctor login status",
      error: error.message,
    });
  }
};

// Login Controller
const loginController = async (req, res) => {
  // console.log(req.body);
  try {
    const user = await userModel.findOne({ email: req.body.email });
    // console.log(user)
    if (!user) {
      return res.status(200).send({ message: "User Not Found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }
    // console.log(process.env)
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",

    });
    
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login Controller: ${error.message}` });
  }
};

// Auth Controller
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    // console.log(user)
    if (!user) {
      return res.status(200).send({ message: "User Not Found", success: false });
    }
    user.password = undefined;
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Authentication Error",
      success: false,
      error,
    });
  }
};

// Apply Doctor Controller
const applyDoctorController = async (req, res) => {
  // console.log(res.body)
  console.log(req.body)
  try {
    const { firstName, lastName, phone, email, specialization, experience, timings, userId } = req.body;

    // Validate input
    if (!firstName || !lastName || !phone || !email || !specialization || !experience || !timings) {
      return res.status(400).send({ success: false, message: "All fields are required." });
    }

    // Create a new doctor application
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();

    // Find the admin user
    const adminUser  = await userModel.findOne({ isAdmin: true });

    // Check if admin user exists
    if (!adminUser ) {
      return res.status(500).send({ success: false, message: "Admin user not found." });
    }

    // Prepare notification for the admin
    const notification = adminUser .notification || [];
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: `${newDoctor.firstName} ${newDoctor.lastName}`,
        onClickPath: "/admin/doctors",
      },
    });

    // Update the admin user's notifications
    await userModel.findByIdAndUpdate(adminUser ._id, { notification });

    res.status(201).send({ success: true, message: "Doctor Account Applied Successfully" });
  } catch (error) {
    console.error("Error while applying for doctor:", error); // Log the error
    res.status(500).send({
      success: false,
      message: "Error While Applying For Doctor",
      error: error.message, // Include the error message in the response
    });
  }
};

// Get All Notifications Controller
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.seennotification.push(...user.notifcation);
    user.notifcation = [];
    await user.save();
    console.log(user)
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in Notification Controller",
      success: false,
      error,
    });
  }
};

// Delete All Notifications Controller
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.notification = [];
    user.seenNotification = [];
    await user.save();
    res.status(200).send({
      success: true,
      message: "Notifications deleted successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Unable to delete all notifications",
      error,
    });
  }
};

// Get All Doctors Controller
const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctor List Fetched Successfully",
      data: doctors,
    });
    // console.log(doctors)
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Fetching Doctors",
    });
  }
};

// Book Appointment Controller
const bookAppointmentController = async (req, res) => {
  try {
    const { date, time } = req.body;

    // Validate that date and time are provided
    if (!date || !time) {
      return res.status(400).send({
        success: false,
        message: "Date and time are required",
      });
    }

    // Format the date and time
    const formattedDate = moment(date, "DD-MM-YYYY").toISOString();
    const formattedTime = moment(time, "HH:mm").toISOString();

    // Check for existing appointments
    const fromTime = moment(formattedTime).subtract(1, "hours").toISOString(); // 1 hour before
    const toTime = moment(formattedTime).add(1, "hours").toISOString(); // 1 hour after

    const existingAppointments = await appointmentModel.find({
      doctorId: req.body.doctorInfo.userId,
      date: formattedDate,
      time: { $gte: fromTime, $lte: toTime },
    });
    console.log(existingAppointments)

    // If there is already an appointment, return a message
    if (existingAppointments.length > 0) {
      return res.status(200).send({
        success: false,
        message: "Doctor is not available at this time", // Message for not available
      });
    }

    // Create a new appointment if available
    req.body.date = formattedDate;
    req.body.time = formattedTime;
    req.body.status = "pending";

    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();

    // Notify the doctor
    const doctorUser  = await userModel.findById(req.body.doctorInfo.userId);
    doctorUser .notifcation.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await doctorUser .save();

    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};

// Booking Availability Controller
const bookingAvailabilityController = async (req, res) => {
  try {
    // Parse date and time from the request body
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString(); // Ensure correct format
    const time = moment(req.body.time, "HH:mm"); // Parse the time for comparison
    const fromTime = time.clone().subtract(1, "hours").toISOString(); // 1 hour before
    const toTime = time.clone().add(1, "hours").toISOString(); // 1 hour after

    // Query for appointments within the specified time range
    const appointments = await appointmentModel.find({
      doctorId: req.body.doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });

    // Check if there is at least one appointment
    if (appointments.length >= 1) {
      return res.status(200).send({
        message: "Appointments not available at this time", // Message for not available
        success: false,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available", // Message for available
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Booking Availability",
    });
  }
};

// Cancel Appointment Controller
const cancelAppointmentController = async (req, res) => {
  try {
    const appointment = await appointmentModel.findById(req.body.appointmentId);
    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found" });
    }
    appointment.status = "canceled";
    await appointment.save();
    res.status(200).send({ success: true, message: "Appointment canceled successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Cancel Appointment Controller",
      error,
    });
  }
};

// Delete Appointment Controller
const deleteAppointmentController = async (req, res) => {
  try {
    const appointment = await appointmentModel.findByIdAndDelete(req.body.appointmentId);
    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found" });
    }
    res.status(200).send({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Delete Appointment Controller",
      error,
    });
  }
};


// Reschedule Appointment Controller
const rescheduleAppointmentController = async (req, res) => {
  try {
    const { appointmentId, newDate, newTime } = req.body;

    // Validate input
    if (!appointmentId || !newDate || !newTime) {
      return res.status(400).send({ success: false, message: "Appointment ID, new date, and new time are required." });
    }

    // Find the appointment
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found" });
    }

    // Update the date and time
    appointment.date = moment(newDate, "DD-MM-YYYY").toISOString(); // Ensure correct format
    appointment.time = moment(newTime, "HH:mm").toISOString(); // Ensure correct format
    appointment.status = "pending"; // Reset status to pending
    // console.log(newDate, newTime)

    // Save the updated appointment
    await appointment.save();

    // Notify the doctor about the rescheduling
    const doctorUser  = await userModel.findById(appointment.doctorInfo.userId); // Use appointment's doctor info
    // console.log(doctorUser)
    if (!doctorUser ) {
      return res.status(404).send({ success: false, message: "Doctor not found" });
    }
    
    // If the doctorUser  exists, proceed to push notification
    // console.log(newDate, newTime)
    doctorUser .notifcation.push({
      type: "appointment-rescheduled",
      message: `Appointment with ${appointment.userInfo.name} has been rescheduled to ${moment(newDate).format("DD-MM-YYYY")} at ${moment(newTime).format("HH:mm")}.`,
      onClickPath: "/doctor/appointments",
    });
    
    await doctorUser .save();

    res.status(200).send({
      success: true,
      message: "Appointment rescheduled successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in rescheduling appointment",
      error,
    });
  }
};

// User Appointments Controller
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "User  Appointments Fetched Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error fetching user appointments",
      error,
    });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  cancelAppointmentController,
  deleteAppointmentController,
  rescheduleAppointmentController,
  checkDoctorLoginStatusController
};
