import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { DatePicker, message, TimePicker } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

import "../styles/BookingPage.css";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctors, setDoctors] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch doctor data
  const getUserData = async () => {
    try {
      const res = await axios.post(
        `http://localhost:7000/api/v1/doctor/getDoctorById`,
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle booking
  const handleBooking = async () => {
    try {
      // Validate date and time
      const selectedDateTime = moment(`${date} ${time}`, "DD-MM-YYYY hh:mm A");
      const currentDateTime = moment();

      // Check if the selected date is in the past
      if (selectedDateTime.isBefore(currentDateTime)) {
        message.error("You cannot book an appointment for a past date or time.");
        return;
      }

      // Validate doctor's available timings
      if (doctors.timings) {
        const [startTime, endTime] = doctors.timings.map((t) =>
          moment(t, "hh:mm A")
        );
        const selectedTime = moment(time, "hh:mm A");

        if (!selectedTime.isBetween(startTime, endTime, null, "[)")) {
          message.error(
            `Please select a time within the doctor's available hours: ${doctors.timings[0]} - ${doctors.timings[1]}.`
          );
          return;
        }
      }

      // Proceed with booking if validation passes
      dispatch(showLoading());
      const res = await axios.post(
        `http://localhost:7000/api/v1/user/book-appointment`,
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctors,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
        navigate("/appointments");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Booking error:", error);
      message.error("An error occurred while booking the appointment. Please try again.");
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <div className="page-wrapper">
        <div className="container">
          <h3>Booking Page</h3>
          <div className="m-2">
            {doctors && (
              <div>
                <h4>
                  Dr. {doctors.firstName} {doctors.lastName}
                </h4>
                <h4>Fees: {doctors.feesPerConsultation}/-</h4>
                <h4>
                  Timings: {doctors.timings && doctors.timings[0]} -{" "}
                  {doctors.timings && doctors.timings[1]}
                </h4>
                <div style={{ justifyContent: "center" }}>
                  <DatePicker
                    className="picker m-2"
                    format="DD-MM-YYYY"
                    onChange={(value) => {
                      setDate(moment(value).format("DD-MM-YYYY"));
                    }}
                    disabledDate={(current) => current && current.isBefore(moment(), 'day')}
                  />

                  <TimePicker
                    format="hh:mm A"
                    className="picker mt-3"
                    onChange={(value) => {
                      setTime(moment(value).format("hh:mm A"));
                    }}
                  />
                </div>

                <button className="btn btn-dark mt-2" onClick={handleBooking}>
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
