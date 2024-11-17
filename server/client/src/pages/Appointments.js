import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import moment from "moment";
import { message, Table, Modal, TimePicker, Input } from "antd";
import '../styles/Appointments.css';

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
        `http://localhost:7000/api/v1/user/user-appointments`,
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
        getAppointments();
      }
    } catch (error) {
      message.error("Failed to delete the appointment");
    }
  };

  // Handle rescheduling of appointment
  const handleReschedule = (appointmentId) => {
    const appointment = appointments.find((appt) => appt._id === appointmentId);
    setSelectedAppointment(appointment);
    setNewDate(moment(appointment.date).format("DD-MM-YYYY"));
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

    try {
      const res = await axios.put(
        `http://localhost:7000/api/v1/user/reschedule-appointment`,
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
              <span className="button__text">Delete</span>
              <span className="button__icon">
                <svg
                  className="svg"
                  height="512"
                  viewBox="0 0 512 512"
                  width="512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M112,112l20,320c.95,18.49,14.4,32,32,32H348c17.67,0,30.87-13.51,32-32l20-320"
                    style={{
                      fill: "none",
                      stroke: "#fff",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "32px",
                    }}
                  ></path>
                  <line
                    style={{
                      stroke: "#fff",
                      strokeLinecap: "round",
                      strokeMiterlimit: "10",
                      strokeWidth: "32px",
                    }}
                    x1="80"
                    x2="432"
                    y1="112"
                    y2="112"
                  ></line>
                  <path
                    d="M192,112V72h0a23.93,23.93,0,0,1,24-24h80a23.93,23.93,0,0,1,24,24h0v40"
                    style={{
                      fill: "none",
                      stroke: "#fff",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "32px",
                    }}
                  ></path>
                  <line
                    style={{
                      fill: "none",
                      stroke: "#fff",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "32px",
                    }}
                    x1="256"
                    x2="256"
                    y1="176"
                    y2="400"
                  ></line>
                  <line
                    style={{
                      fill: "none",
                      stroke: "#fff",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "32px",
                    }}
                    x1="184"
                    x2="192"
                    y1="176"
                    y2="400"
                  ></line>
                  <line
                    style={{
                      fill: "none",
                      stroke: "#fff",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "32px",
                    }}
                    x1="328"
                    x2="320"
                    y1="176"
                    y2="400"
                  ></line>
                </svg>
              </span>
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
      <div style={{ height: 'calc(100vh - 100px)' }}>
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
