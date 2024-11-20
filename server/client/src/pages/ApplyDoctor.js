import React from "react";
import Layout from "./../components/Layout";
import { Col, Form, Input, Row, TimePicker, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import axios from "axios";
import moment from "moment";

import '../styles/ApplyDoctor.css'

const ApplyDoctor = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle form submission
  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());

      // Check if timings are provided
      if (!values.timings || values.timings.length !== 2) {
        message.error("Please select both start and end timings.");
        dispatch(hideLoading());
        return;
      }

      const res = await axios.post(
        `http://localhost:7000/api/v1/user/apply-doctor`,
        {
          ...values,
          userId: user._id,
          timings: [
            moment(values.timings[0]).format("hh:mm A"),
            moment(values.timings[1]).format("hh:mm A"),
          ],
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
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error while applying for doctor:", error); // Log the error
      message.error("Something Went Wrong");
    }
  };

  return (
    <Layout>
      {/* <h1 className="text-center">Apply Doctor</h1> */}
      <Form layout="vertical" onFinish={handleFinish} className="m-3">
        <h4>Personal Details:</h4>
        <Row gutter={20}>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="First Name"
              name="firstName"
              required
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input type="text" placeholder="Your first name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
 label="Last Name"
              name="lastName"
              required
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input type="text" placeholder="Your last name" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Phone No"
              name="phone"
              required
              rules={[{ required: true, message: "Phone number is required" }]}
            >
              <Input type="text" placeholder="Your contact no" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Email"
              name="email"
              required
              rules={[{ required: true, type: 'email', message: "Valid email is required" }]}
            >
              <Input type="email" placeholder="Your email address" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item label="Website" name="website">
              <Input type="text" placeholder="Your website" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Address"
              name="address"
              required
              rules={[{ required: true, message: "Address is required" }]}
            >
              <Input type="text" placeholder="Your clinic address" />
            </Form.Item>
          </Col>
        </Row>
        <h4>Professional Details:</h4>
        <Row gutter={20}>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Specialization"
              name="specialization"
              required
              rules={[{ required: true, message: "Specialization is required" }]}
            >
              <Input type="text" placeholder="Your specialization" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Experience"
              name="experience"
              required
              rules={[{ required: true, message: "Experience is required" }]}
            >
              <Input type="text" placeholder="Your experience" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Timings"
              name="timings"
              required
              rules={[{ required: true, message: "Timings are required" }]}
            >
              <TimePicker.RangePicker format="hh:mm A" />
            </Form.Item>
          </Col>
          <Col xs={24} md={24} lg={8}>
            <Form.Item
              label="Fees Per Consultation"
              name="feesPerConsultation"
              required
              rules={[{ required: true, message: "Fees are required" }]}
            >
              <Input type="number" placeholder="Your consultation fees" />
            </Form.Item>
          </Col>
        </Row>
        <button type="submit" className="btn btn-primary">Submit</button>
      </Form>
    </Layout>
  );
};

export default ApplyDoctor;