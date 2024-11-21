import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import moment from "moment";
import { message, Table } from "antd";
import "../../styles/DoctorAppointment.css"; // Import the CSS file


const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  console.log(appointments)

  const getAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/v1/doctor/doctor-appointments", {
        headers: {  
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  const handleStatus = async (record, status) => {
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/doctor/update-status",
        { appointmentsId: record._id, status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        message.success(res.data.message);
        getAppointments();
      }
    } catch (error) {
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => {
        const { userInfo } = record; // Destructure doctorInfo from the record
        return userInfo ? userInfo.name : ''; // Return the name from doctorInfo
      },
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (text, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} &nbsp;
          {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="appointment-actions">
          {record.status === "pending" && (
            <div className="action-buttons">
              <button
                className="btn-success"
                onClick={() => handleStatus(record, "approved")}
              >
                Approved
              </button>
              <button
                className="btn-danger"
                onClick={() => handleStatus(record, "rejected")}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="appointments-page">
        {/* <h1 className="appointments-title">Appointments Lists</h1> */}
        <div className="appointments-table-container">
          <Table
            columns={columns}
            dataSource={appointments}
            className="appointments-table"
            scroll={{ x: true }} // Enable horizontal scrolling for the table
          />
        </div>
      </div>
    </Layout>
  );
};

export default DoctorAppointments;
