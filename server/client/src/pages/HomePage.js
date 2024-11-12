import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "./../components/Layout";
import { Row } from "antd";
import DoctorList from "../components/DoctorList";

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  // console.log(doctors)
  // login user data
  const getUserData = async () => {
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
        // console.log(res.daat);
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <h1 className="text-center">Home Page</h1>
      <Row>
        {doctors.length > 0 ? (
          doctors.map((doctor) => <DoctorList key={doctor.id} doctor={doctor} />)
        ) : (
          <h2 className="text-center">Hello</h2>
        )}
      </Row>
    </Layout>
  );
};

export default HomePage;
