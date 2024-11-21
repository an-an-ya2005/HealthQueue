import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "../styles/ProfilePage.css";
import { message } from "antd";

export default function ProfilePage() {
  const [user, setUser] = useState(null); // Store logged-in user's profile

  // Fetch logged-in user profile
  const getProfile = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/v1/user/getUserDatabyId", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log("API Response:", res.data); // Debugging response
      if (res.data.success) {
        setUser(res.data.data); // Set user data
      } else {
        message.error(res.data.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error); // Log error
      message.error(`Error fetching profile: ${error.message}`);
    }
  };
  

  useEffect(() => {
    getProfile();
  }, []);

  return (
    // <Layout>
      <div className="profile-page">
        {user ? (
          <div className="user-card">
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">Email: {user.email}</p>
            <p className="user-role">
              Role: {user.isAdmin ? "Admin" : user.isDoctor ? "Doctor" : "User"}
            </p>
            <p className="user-notifications">
              {/* Notifications: {user.notifcation.length}  */}
            </p>
          </div>
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    // </Layout>
  );
}
