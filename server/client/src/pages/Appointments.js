import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { message, Table, Modal, TimePicker, Input } from "antd";
import "../styles/Appointments.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState(null);

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
      }
    } catch (error) {
      message.error("Failed to fetch appointments");
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
      }
    } catch (error) {
      message.error("Failed to cancel the appointment");
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
      }
    } catch (error) {
      message.error("Failed to delete the appointment");
    }
  };

  // Check doctor availability
  const checkDoctorAvailability = async (doctorId, date, time) => {
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/user/booking-availability",
        { doctorId, date, time },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return res.data.success; // Returns true if available, false otherwise
    } catch (error) {
      console.error("Error checking doctor availability:", error);
      return false;
    }
  };

  // Handle rescheduling of appointment
  const handleReschedule = (appointmentId) => {
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    setSelectedAppointment(appointment);
    setNewDate(moment(appointment.date).format("YYYY-MM-DD")); // Input requires YYYY-MM-DD format
    setNewTime(moment(appointment.time, "HH:mm"));
    setIsModalVisible(true);
  };

  // Handle "OK" click on the modal to save rescheduled appointment
  const handleModalOk = async () => {
    if (!newDate || !newTime || !moment(newTime).isValid()) {
      message.error("Please fill in both date and time correctly");
      return;
    }

    const formattedTime = moment(newTime).format("HH:mm");
    const formattedDate = moment(newDate).format("DD-MM-YYYY");

    // Check doctor availability before proceeding
    const isAvailable = await checkDoctorAvailability(
      selectedAppointment.doctorId, // Assuming `doctorId` exists in appointment data
      formattedDate,
      formattedTime
    );
    console.log(isAvailable)

    if (!isAvailable) {
      message.error("The doctor is not available at the selected time.");
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

      if (res.data.success) {
        message.success("Appointment rescheduled successfully");
        setIsModalVisible(false);
        getAppointments();
      } else {
        message.error("Failed to reschedule the appointment");
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
      render: (text, record) => record.doctorName || "N/A",
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <div>
          <span>
            {moment(record.date).format("DD-MM-YYYY")} &nbsp;
            {record.time ? moment(record.time).format("HH:mm") : "N/A"}
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
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <label>New Time: </label>
            <TimePicker
              format="HH:mm"
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
