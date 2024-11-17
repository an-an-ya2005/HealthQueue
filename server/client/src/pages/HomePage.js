import { useEffect, useState } from "react";
import * as React from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row } from "antd";
import DoctorList from "../components/DoctorList";
import { LoadingButton } from "@mui/lab";
import Skeleton from "@mui/material/Skeleton";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [currentDoctor, setCurrentDoctor] = useState(null);

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
        console.log(allDoctors)

        // Decode token to get logged-in user's email
        const userToken = localStorage.getItem("token");
        const decodedToken = decodeToken(userToken); // Decode the token
        const loggedInEmail = decodedToken?.email;

        // Find the logged-in doctor's details
        const loggedInDoctor = allDoctors.find(
          (doctor) => doctor.email === loggedInEmail
        );

        // Set current doctor (or handle if not found)
        setCurrentDoctor(loggedInDoctor || null);

        // Set the doctors list
        setDoctors(allDoctors);

        // Log the matching doctor's details for verification
        console.log("Logged-in Doctor:", loggedInDoctor);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  // Decode the token to extract payload (simplified decoding for demonstration)
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
  }, []);

  // Filter doctors excluding the logged-in doctor
  const filteredDoctors = doctors.filter(
    (doctor) => doctor.email !== currentDoctor?.email
  );

  return (
    <Layout>
      <h1 className="text-center">Doctors</h1>
      <Row>
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <DoctorList key={doctor._id} doctor={doctor} />
          ))
        ) : (
          // Display loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div
              className="card m-2"
              style={{ cursor: "pointer" }}
              key={index}
            >
              <div
                className="card-header"
                style={{ display: "flex", alignItems: "center" }}
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
        )}
      </Row>
    </Layout>
  );
};

export default HomePage;
