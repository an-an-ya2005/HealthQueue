const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const sendEmail = require("../utils/email");

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
  // console.log(req.body)
  try {
    const doctor = await doctorModel.findById(req.body.doctorId);
    // console.log(doctor)
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
      user.notifcation = user.notifcation || [];
      user.notifcation.push({
        type: "status-updated",
        message: `Your appointment status has been updated to: ${status}`,
        onClickPath: "/doctor-appointments",
      });
      await user.save();
    }

    const fullName = `${appointment.doctorInfo.firstName} ${appointment.doctorInfo.lastName}`;
    const emailSubject = "Appointment Statement";

    let emailBody = "";

    if (status === "approved") {
      emailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f4f4f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 20px;">
          <h2 style="color: #333; font-size: 24px;">Appointment Approved</h2>
          <p style="font-size: 16px; color: #666;">Thank you for choosing our clinic!</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">Dear <strong style="color: #2c3e50;">${user.name}</strong>,</p>
        
        <p style="font-size: 16px; color: #333;">Your appointment with <strong style="color: #2c3e50;">Dr. ${fullName} (${appointment.doctorInfo.specialization})</strong> has been successfully approved.</p>
        
        <p style="font-size: 16px; color: #333;"><strong style="color: #2c3e50;">Appointment Details:</strong></p>
        
        <ul style="list-style-type: none; padding: 0; font-size: 16px; color: #333;">
          <li style="padding: 5px 0;">Date: <span style="font-weight: bold;">${appointment.date}</span></li>
          <li style="padding: 5px 0;">Time: <span style="font-weight: bold;">${appointment.time}</span></li>
        </ul>
        
        <p style="font-size: 16px; color: #333;">Thank you for choosing our service!</p>
        
        <div style="border-top: 2px solid #e0e0e0; margin-top: 20px; padding-top: 20px;">
          <p style="font-size: 16px; color: #333;">Regards, <br><strong>Your Clinic Team</strong></p>
        </div>
      </div>`;
    } else if (status === "rejected") {
      emailBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f4f4f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <div style="text-align: center; padding: 20px;">
          <h2 style="color: #333; font-size: 24px;">Appointment Rejected</h2>
          <p style="font-size: 16px; color: #666;">We regret to inform you about the status of your appointment.</p>
        </div>
        
        <p style="font-size: 16px; color: #333;">Dear <strong style="color: #2c3e50;">${user.name}</strong>,</p>
        
        <p style="font-size: 16px; color: #333;">Your appointment with <strong style="color: #2c3e50;">Dr. ${fullName} (${appointment.doctorInfo.specialization})</strong> has been rejected. We apologize for the inconvenience.</p>
        
        <p style="font-size: 16px; color: #333;">Please contact us for further details or to reschedule your appointment.</p>
        
        <div style="border-top: 2px solid #e0e0e0; margin-top: 20px; padding-top: 20px;">
          <p style="font-size: 16px; color: #333;">Regards, <br><strong>Your Clinic Team</strong></p>
        </div>
      </div>`;
    }

    if (user.email) {
      await sendEmail(user.email, emailSubject, emailBody);
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
