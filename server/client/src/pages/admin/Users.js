import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { Table } from "antd";

const Users = () => {
  const [users, setUsers] = useState([]);

  // Fetch users from the backend
  const getUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/api/v1/admin/getAllUsers",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Toggle block/unblock user
  const toggleBlockUser = async (userId) => {
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/admin/toggleBlockUser",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        alert(`User has been ${res.data.isBlocked ? "blocked" : "unblocked"} successfully`);
        getUsers(); // Refresh the user list
      }
    } catch (error) {
      console.error("Error toggling user block status:", error);
      alert("Failed to toggle user block status");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Ant Design Table Columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Doctor",
      dataIndex: "isDoctor",
      render: (text, record) => <span>{record.isDoctor ? "Yes" : "No"}</span>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <div className="d-flex">
          <button
            className={`btn ${record.isBlocked ? "btn-success" : "btn-danger"}`}
            onClick={() => toggleBlockUser(record._id)}
          >
            {record.isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ height: "calc(100vh - 100px)", justifyContent: "center" }}>
        <h1 className="text-center m-2">Users List</h1>
        <Table columns={columns} dataSource={users} rowKey="_id" />
      </div>
    </Layout>
  );
};

export default Users;
