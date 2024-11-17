const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

// Get doctor info by userId
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error in fetching doctor details:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor details",
    });
  }
};

// Update doctor profile
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true } // Return the updated document
    );
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Doctor profile updated successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error in updating doctor profile:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating doctor profile",
    });
  }
};

// Get single doctor by doctorId
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Single doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error in fetching single doctor info:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching single doctor info",
    });
  }
};

// Get doctor by ID from route parameters
// const getDoctor = async (req, res) => {
//   try {
//     const doctorId = req.params.id;
//     const doctor = await doctorModel.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ success: false, message: "Doctor not found" });
//     }
//     res.status(200).json({ success: true, data: doctor });
//   } catch (error) {
//     console.error("Error fetching doctor data:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// Get all appointments for a doctor by userId
const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res.status(404).send({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });
    // console.log(appointments)
    res.status(200).send({
      success: true,
      message: "Doctor appointments fetched successfully",
      data: appointments,
    });
  } catch (error) {
    console.error("Error in fetching doctor appointments:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching doctor appointments",
    });
  }
};

// Update appointment status
const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).send({
        success: false,
        message: "Appointment not found",
      });
    }

    const user = await userModel.findById(appointment.userId);
    if (user) {
      user.notification = user.notification || [];
      user.notification.push({
        type: "status-updated",
        message: `Your appointment status has been updated to: ${status}`,
        onClickPath: "/doctor-appointments",
      });
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: "Appointment status updated successfully",
    });
  } catch (error) {
    console.error("Error in updating appointment status:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in updating appointment status",
    });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
  // getDoctor,
};
