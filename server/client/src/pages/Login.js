import React from "react";
import "../styles/RegiserStyles.css";
import { Form, Input, message } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../redux/features/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // form handler
  const onfinishHandler = async (values) => {
    console.log(values);
    try {
      dispatch(showLoading());
      
      const res = await axios.post(`http://localhost:7000/api/v1/user/login`, values);

      dispatch(hideLoading());

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        message.success("Login Successful");
        dispatch(setUser(null));
        navigate("/"); // Navigate to home page after login
      } else {
        message.error(res.data.message); // Display the error message from the server
      }
    } catch (error) {
      dispatch(hideLoading());
      console.log(error);
      
      // If the error is a 403 (blocked user), display the blocked message
      if (error.response && error.response.status === 403) {
        message.error("Your account has been blocked. Please contact support.");
      } else {
        message.error("Something went wrong");
      }
    }
  };

  return (
    <div className="form-container">
      <Form layout="vertical" onFinish={onfinishHandler} className="register-form">
        <h3 className="text-center">Login Form</h3>

        <Form.Item label="Email" name="email">
          <Input type="email" required />
        </Form.Item>
        
        <Form.Item label="Password" name="password">
          <Input type="password" required />
        </Form.Item>

        <Link to="/register" className="m-2">
          Not a user? Register here
        </Link>

        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </Form>
    </div>
  );
};

export default Login;
