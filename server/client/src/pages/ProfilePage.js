import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null); // Store logged-in user's profile
  const [error, setError] = useState(""); // Error handling

  // Fetch logged-in user profile
  const getProfile = async () => {
    try {
      const res = await axios.get("http://localhost:7000/api/v1/user/getUserData", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.data.success) {
        setUser(res.data.data); // Assuming 'data' contains user information
      } else {
        setError("Failed to fetch profile");
      }
    } catch (error) {
      setError("Error fetching profile: " + error.message);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <Layout>
      <div className="profile-page">
        <h1 className="page-title">My Profile</h1>
        {error && <p className="error-message">{error}</p>}
        {user ? (
          <div className="user-card">
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">Email: {user.email}</p>
            <p className="user-role">
              Role: {user.isAdmin ? "Admin" : user.isDoctor ? "Doctor" : "User"}
            </p>
            <p className="user-notifications">
              Notifications: {user.notifcation.length} new
            </p>
          </div>
        ) : (
          !error && <p>Loading profile...</p>
        )}
      </div>
    </Layout>
  );
}
