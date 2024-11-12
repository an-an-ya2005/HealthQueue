import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { message, Table, Modal, TimePicker, Input } from "antd"; // Import TimePicker and Input from Ant Design
import '../styles/Appointments.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState(""); 
  const [newTime, setNewTime] = useState(null); // Only store a single time

  // Handle appointment cancellation
  const handleCancel = async (appointmentId) => {
    try {
      const res = await axios.post(
        `http://localhost:7000/api/v1/user/cancel-appointment`,
        { appointmentId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success("Appointment canceled successfully");
        getAppointments(); // Refresh the appointment list after cancellation
      }
    } catch (error) {
      message.error("Failed to cancel the appointment");
    }
  };

  // Handle appointment deletion
  const handleDelete = async (appointmentId) => {
    try {
      const res = await axios.delete(
        `http://localhost:7000/api/v1/user/delete-appointment`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: { appointmentId },
        }
      );
      if (res.data.success) {
        message.success("Appointment deleted successfully");
        getAppointments(); // Refresh the appointment list after deletion
      }
    } catch (error) {
      message.error("Failed to delete the appointment");
    }
  };

  // Handle rescheduling of appointment
  const handleReschedule = (appointmentId) => {
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    setSelectedAppointment(appointment);
    setNewDate(moment(appointment.date).format("YYYY-MM-DD"));
    setIsModalVisible(true); // Show modal to select a new date and time
  };

  // Handle "OK" click on the modal to save rescheduled appointment
  const handleModalOk = async () => {
    if (!newDate || !newTime || !moment(newTime).isValid()) {
      message.error("Please fill in both date and time correctly");
      return;
    }
  
    const formattedTime = moment(newTime).format("HH:mm"); // Format time correctly
    console.log("Formatted Time:", formattedTime); // Log formatted time
  
    try {
      const res = await axios.post(
        `http://localhost:7000/api/v1/user/reschedule-appointment`,
        {
          appointmentId: selectedAppointment._id,
          newDate,
          newTime: formattedTime, // Send the formatted time to the backend
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (res.data.success) {
        message.success("Appointment rescheduled successfully");
        setIsModalVisible(false);
        getAppointments(); // Refresh the appointments list after successful reschedule
      } else {
        message.error("Failed to reschedule the appointment");
      }
    } catch (error) {
      message.error("Failed to reschedule the appointment");
    }
  };
  
  
  
  const handleTimeChange = (time) => {
    console.log("Selected Time:", time);
    setNewTime(time);
  };
  

  // Handle modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false); // Close modal without saving changes
  };

  // Fetch user's appointments
  const getAppointments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:7000/api/v1/user/user-appointments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setAppointments(res.data.data); // Set appointments data
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Run when component mounts to fetch appointments
  useEffect(() => {
    getAppointments();
  }, []);

  // Define columns for the Ant Design table
  const columns = [
    {
      title: "Doctor's Name",
      dataIndex: "doctorName",
      render: (text, record) => record.doctorName || "N/A",
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <div>
          <span>
            {moment(record.date).format("DD-MM-YYYY")} &nbsp;
            {moment(record.time).format("HH:mm")}
          </span>
          {record.status !== "canceled" && (
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
      render: (text, record) =>
        record.status === "canceled" ? (
          <button
            className="button"
            type="button"
            onClick={() => handleDelete(record._id)}
          >
            <span className="button__text">Delete</span>
          </button>
        ) : (
          <button
            className="card-button secondary"
            onClick={() => handleCancel(record._id)}
          >
            Cancel
          </button>
        ),
    },
  ];

  return (
    <Layout>
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
    />
  </div>
  <div style={{ marginTop: 10 }}>
    <label>New Time: </label>
    <TimePicker
  format="HH:mm"
  value={newTime} // This should be a valid moment object
  onChange={(time) => {
    console.log("Time Selected:", time); // Log the selected time for debugging
    setNewTime(time); // Set the selected time
  }}
/>


  </div>
</Modal>

    </Layout>
  );
};

export default Appointments;
