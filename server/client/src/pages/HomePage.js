import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row } from "antd";
import DoctorList from "../components/DoctorList";
import { LoadingButton } from '@mui/lab';
import Skeleton from '@mui/material/Skeleton';

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [currentDoctorEmail, setCurrentDoctorEmail] = useState(null); // State to hold logged-in doctor's email
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const getAllDoctors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/api/v1/user/getAllDoctors",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        const allDoctors = res.data.data;
        const userToken = localStorage.getItem("token");
        const userId = decodeToken(userToken)?.id;

        // Find the current user's doctorId and email in the response
        const loggedInDoctor = allDoctors.find((doctor) => doctor.userId === userId);
        setCurrentDoctorId(loggedInDoctor?.id || null);
        setCurrentDoctorEmail(loggedInDoctor?.email || null); // Set logged-in doctor's email

        // Set doctors list
        setDoctors(allDoctors);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkDoctorLoginStatus = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/api/v1/user/checkLoginStatus",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        setIsDoctorLoggedIn(true);
      } else {
        setIsDoctorLoggedIn(false);
      }
    } catch (error) {
      console.log("Error checking doctor login status:", error);
      setIsDoctorLoggedIn(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    getAllDoctors();
    checkDoctorLoginStatus();
  }, []);

  // Filter doctors excluding the one matching the current logged-in user's doctor ID
  const filteredDoctors = doctors.filter(
    (doctor) => doctor.id !== currentDoctorId
  );

  return (
    <Layout>
      <div style={{ height: 'calc(100vh - 100px)', justifyContent:'center' }}>

      <h1 className="text-center">Doctor's</h1>
      <Row>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              className="card m-2"
              style={{ cursor: "pointer" }}
              key={index}
            >
              <div
                className="card-header"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <LoadingButton />
              </div>
              <div className="card-body">
                <p>
                  <Skeleton variant="rounded" width={180} height={35} />
                </p>
                <p>
                  <Skeleton variant="rounded" width={130} height={20} />
                </p>
                <p>
                  <Skeleton variant="rounded" width={180} height={30} />
                </p>
                <p>
                  <Skeleton variant="rounded" width={180} height={15} />
                </p>
              </div>
            </div>
          ))
        ) : (
          filteredDoctors .length > 0 ? (
            filteredDoctors.map((doctor) => (
              <DoctorList key={doctor.id} doctor={doctor} email={currentDoctorEmail} />
            ))
          ) : (
            <p>No doctors available.</p>
          )
        )}
      </Row>
      </div>
      <div className="search-bar">
    <input type="text" placeholder="Search..." />
    <button className="search-button">
      <i className="fa-solid fa-search"></i>
    </button>
  </div>
    </Layout>
  );
};

export default HomePage;