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

// Login Controller
const loginController = async (req, res) => {
  // console.log(req.body);
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User Not Found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }
    // console.log("JWT_SECRET:", process.env.JWT_SECRET);
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
  try {
    // console.log(res)
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification || [];
    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a Doctor account`,
      data: {
        doctorId: newDoctor._id,
        name: `${newDoctor.firstName} ${newDoctor.lastName}`,
        onClickPath: "/admin/doctors",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({ success: true, message: "Doctor Account Applied Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Applying For Doctor",
    });
  }
};

// Get All Notifications Controller
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.seenNotification.push(...user.notification);
    user.notification = [];
    await user.save();
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
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const doctorUser = await userModel.findById(req.body.doctorInfo.userId);
    doctorUser.notification.push({
      type: "New-appointment-request",
      message: `A new appointment request from ${req.body.userInfo.name}`,
      onClickPath: "/user/appointments",
    });
    await doctorUser.save();
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
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const appointments = await appointmentModel.find({
      doctorId: req.body.doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not available at this time",
        success: false,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
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

//rreschedule Appointment Controller
// Reschedule Appointment Controller
const rescheduleAppointmentController = async (req, res) => {
  try {
    // Extract the necessary data from the request body
    const { appointmentId, newDate, newTime } = req.body;

    // Find the appointment by its ID
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).send({ success: false, message: "Appointment not found" });
    }

    // Convert new date and time to ISO strings
    const updatedDate = moment(newDate, "DD-MM-YYYY").toISOString();
    const updatedTime = moment(newTime, "HH:mm").toISOString();

    // Check if the new date/time is available (this can be done using bookingAvailabilityController)
    const fromTime = moment(updatedTime).subtract(1, "hours").toISOString();
    const toTime = moment(updatedTime).add(1, "hours").toISOString();

    const existingAppointments = await appointmentModel.find({
      doctorId: appointment.doctorId,
      date: updatedDate,
      time: { $gte: fromTime, $lte: toTime },
    });

    if (existingAppointments.length > 0) {
      return res.status(200).send({
        success: false,
        message: "Appointments not available at this new time",
      });
    }

    // Update the appointment's date and time
    appointment.date = updatedDate;
    appointment.time = updatedTime;
    appointment.status = "pending"; // Reset the status to pending if required

    await appointment.save();

    // Optionally, you could send a notification to the doctor about the rescheduled appointment
    const doctorUser = await userModel.findById(appointment.doctorId);
    doctorUser.notification.push({
      type: "appointment-rescheduled",
      message: `Appointment with ${appointment.userInfo.name} has been rescheduled.`,
      onClickPath: "/doctor/appointments",
    });
    await doctorUser.save();

    // Respond with success
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
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "User Appointments Fetched Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in User Appointments",
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
  rescheduleAppointmentController
};
