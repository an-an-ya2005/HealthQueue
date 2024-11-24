import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { message, Table, Modal, TimePicker, Input } from "antd";
import "../styles/Appointments.css";
import { useParams } from "react-router-dom";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState(moment()); // Initialize with current time
  const [doctors, setDoctors] = useState([]);
  const params = useParams();

  // Fetch user's appointments
  
  const getAppointments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/api/v1/user/user-appointments",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        message.error("Failed to fetch appointments");
      }
    } catch (error) {
      message.error("Failed to fetch appointments");
      console.error(error);
    }
  };

  // Run when component mounts to fetch appointments
  useEffect(() => {
    getAppointments();
  }, []);

  // Handle appointment cancellation
  const handleCancel = async (appointmentId) => {
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/user/cancel-appointment",
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success("Appointment canceled successfully");
        getAppointments();
      } else {
        message.error("Failed to cancel the appointment");
      }
    } catch (error) {
      message.error("Failed to cancel the appointment");
      console.error(error);
    }
  };

  // Handle appointment deletion
  const handleDelete = async (appointmentId) => {
    try {
      const res = await axios.delete(
        "http://localhost:7000/api/v1/user/delete-appointment",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: { appointmentId },
        }
      );
      if (res.data.success) {
        message.success("Appointment deleted successfully");
        getAppointments();
      } else {
        message.error("Failed to delete the appointment");
      }
    } catch (error) {
      message.error("Failed to delete the appointment");
      console.error(error);
    }
  };

  // Validate if the new time is within the doctor's working hours
  const isTimeWithinWorkingHours = (selectedTime, doctorTimings) => {
    if (!doctorTimings || doctorTimings.length !== 2) return false; // Ensure valid timings array
  
    const [startWorkingTime, endWorkingTime] = doctorTimings;
  
    // Convert doctor timings to moment objects
    const startTime = moment(startWorkingTime, "hh:mm A");
    const endTime = moment(endWorkingTime, "hh:mm A");
    
    // Convert selected time to moment object
    const selectedMoment = moment(selectedTime, "hh:mm A");
  
    // Check if the selected time is within the working hours
    return selectedMoment.isBetween(startTime, endTime, null, "[]"); // Include start and end time in the check
  };

  // Handle rescheduling of appointment
  const handleReschedule = (appointmentId) => {
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    setSelectedAppointment(appointment);
    setNewDate(moment(appointment.date).format("YYYY-MM-DD")); // Input requires YYYY-MM-DD format
    setNewTime(moment(appointment.time, "hh:mm A")); // Initialize with the appointment time
    setIsModalVisible(true);
  };

  // Handle "OK" click on the modal to save rescheduled appointment
  const handleModalOk = async () => {
    const formattedTime = newTime ? moment(newTime).format("hh:mm A") : null;
    const formattedDate = moment(newDate).format("DD-MM-YYYY");
  
    if (!formattedTime || !newTime.isValid()) {
      message.error("Please select a valid time.");
      return;
    }
  
    const doctorTimings = selectedAppointment.doctorInfo.timings;
  
    if (!isTimeWithinWorkingHours(formattedTime, doctorTimings)) {
      message.error("Selected time is outside the doctor's working hours.");
      return;
    }
  
    try {
      const res = await axios.put(
        "http://localhost:7000/api/v1/user/reschedule-appointment",
        {
          appointmentId: selectedAppointment._id,
          newDate: formattedDate,
          newTime: formattedTime,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      // Log the response to understand the structure
      console.log("API response:", res);
  
      // Log the response data specifically
      console.log("Response Data:", res.data);
  
      if (res.data.success) {
        message.success("Appointment rescheduled successfully");
        setIsModalVisible(false);
        getAppointments();
      } else {
        message.error(`Failed to reschedule the appointment: ${res.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error in rescheduling:", error);
      message.error("Failed to reschedule the appointment");
    }
  };  

  const handleTimeChange = (time) => {
    setNewTime(time);
  };

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Define columns for the Ant Design table
  const columns = [
    {
      title: "Doctor's Name",
      dataIndex: "doctorName",
      render: (text, record) => {
        const { firstName, lastName } = record.doctorInfo;
        return `${firstName || "N/A"} ${lastName || ""}`.trim(); // Trim to remove extra spaces if lastName is empty
      },
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <div>
          <span>
            {moment(record.date).format("DD-MM-YYYY")} &nbsp;
            {record.time ? moment(record.time).format("hh:mm A") : "N/A"}
          </span>
          {record.status !== "reject" && record.status !== "canceled" && (
            <button
              className="card-button secondary"
              onClick={() => handleReschedule(record._id)}
              style={{ marginLeft: "10px" }}
            >
              Reschedule
            </button>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        // Show "Delete" button only if status is "rejected"
        if (record.status === "reject") {
          return (
            <button
              className="button"
              type="button"
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </button>
          );
        } else {
          // Show "Cancel" button for all statuses except "rejected"
          return (
            <>
              {record.status !== "canceled" && (
                <button
                  className="card-button secondary"
                  onClick={() => handleCancel(record._id)}
                >
                  Cancel
                </button>
              )}
            </>
          );
        }
      },
    },
  ];

  return (
    <Layout>
      <div style={{ height: "calc(100vh - 100px)" }}>
        <h1>Appointments List</h1>
        <Table columns={columns} dataSource={appointments} />

        {/* Modal for rescheduling appointment */}
        <Modal
          title="Reschedule Appointment"
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
        >
          <div>
            <label>New Date: </label>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={moment().format("YYYY-MM-DD")}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <label>New Time: </label>
            <TimePicker
              format="hh:mm A"
              value={newTime}
              onChange={handleTimeChange}
            />
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Appointments;
