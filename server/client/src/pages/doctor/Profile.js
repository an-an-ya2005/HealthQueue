import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Col, Form, Input, Row, TimePicker, message, Modal } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/alertSlice";
import moment from "moment";

import './Profile.css'

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const handleFinish = async (values) => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "http://localhost:7000/api/v1/doctor/updateProfile",
        {
          ...values,
          userId: user._id,
          timings: [
            moment(values.timings[1]).format("hh:mm A"),
            moment(values.timings[0]).format("hh:mm A"),
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
        message.error(res.data.success);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      message.error("Something Went Wrong");
    }
  };

  const getDoctorInfo = async () => {
    try {
      const res = await axios.post(
        "http://localhost:7000/api/v1/doctor/getDoctorInfo",
        { userId: params.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDoctorInfo();
  }, []);

  const handlePreview = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <Layout>
      <h1>Manage Profile</h1>
      {doctor && (
        <>
          <Form
            layout="vertical"
            onFinish={handleFinish}
            className="m-3"
            initialValues={{
              ...doctor,
              timings: [
                moment(doctor.timings[0], "hh:mm A"),
                moment(doctor.timings[1], "hh:mm A"),
              ],
            }}
          >
            <h4 className="">Personal Details:</h4>
            <Row gutter={20}>
              {/* Personal Details */}
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="your first name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="your last name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Phone No"
                  name="phone"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="your contact no" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="email" placeholder="your email address" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label="Website" name="website">
                  <Input type="text" placeholder="your website" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Address"
                  name="address"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="your clinic address" />
                </Form.Item>
              </Col>
            </Row>
            <h4>Professional Details:</h4>
            <Row gutter={20}>
              {/* Professional Details */}
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Specialization"
                  name="specialization"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="your specialization" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Experience"
                  name="experience"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="your experience" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item
                  label="Fees Per Consultation"
                  name="feesPerConsultation"
                  required
                  rules={[{ required: true }]}
                >
                  <Input type="text" placeholder="Fees Per Consultation" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <Form.Item label="Timings" name="timings" required>
                  <TimePicker.RangePicker format="hh:mm A" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <button
                  className="btn btn-primary form-btn"
                  type="button"
                  onClick={handlePreview}
                >
                  Preview Profile
                </button>
              </Col>
              <Col xs={24} md={24} lg={8}>
                <button className="btn btn-primary form-btn" type="submit">
                  Update
                </button>
              </Col>
            </Row>
          </Form>

          {/* Modal for Profile Preview */}
          <Modal
            // title="Profile Preview"
            visible={isModalVisible}
            onCancel={handleModalClose}
            footer={null}
          >
            <div className="profile-preview">
              <div className="profile-header">
                <h3>{doctor.firstName} {doctor.lastName}</h3>
                <p>{doctor.specialization}</p>
              </div>
              
              <div className="profile-details">
                <div className="profile-section">
                  <h5>Contact Information</h5>
                  <p><strong>Phone:</strong> {doctor.phone}</p>
                  <p><strong>Email:</strong> {doctor.email}</p>
                  <p><strong>Website:</strong> {doctor.website || "N/A"}</p>
                  <p><strong>Address:</strong> {doctor.address}</p>
                </div>
                
                <div className="profile-section">
                  <h5>Professional Details</h5>
                  <p><strong>Experience:</strong> {doctor.experience}</p>
                  <p><strong>Fees Per Consultation:</strong> {doctor.feesPerConsultation}</p>
                  <p><strong>Timings:</strong> {doctor.timings[0]} - {doctor.timings[1]}</p>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </Layout>
  );
};

export default Profile;
