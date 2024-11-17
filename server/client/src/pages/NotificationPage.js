import React from "react";
import Layout from "./../components/Layout";
import { message, Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/NotificationPage.css";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "http://localhost:7000/api/v1/user/get-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Something went wrong");
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await axios.post(
        "http://localhost:7000/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Something went wrong in notifications");
    }
  };

  const sortNotificationsByTime = (notifications) => {
    return [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  return (
    <Layout>
      <h4 className="p-3 text-center">Notification Page</h4>
      <Tabs>
        <Tabs.TabPane tab="Unread" key={0}>
          <div className="d-flex justify-content-end">
            <h4
              className="p-2"
              onClick={handleMarkAllRead}
              style={{ cursor: "pointer" }}
            >
              Mark All Read
            </h4>
          </div>
          <div className="notification-scrollable">
            {sortNotificationsByTime(user?.notifcation || []).map((notificationMgs) => (
              <div
                key={notificationMgs._id}
                className="notification-card"
                onClick={() => navigate(notificationMgs.onClickPath)}
              >
                <div className="card-header">
                  <p>Messages for You Doctor.</p>
                </div>
                <div className="card-body">
                  <p>{notificationMgs.message}</p>
                  <small>{new Date(notificationMgs.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Read" key={1}>
          <div className="d-flex justify-content-end">
            <h4
              className="p-2 text-primary"
              style={{ cursor: "pointer" }}
              onClick={handleDeleteAllRead}
            >
              Delete All Read
            </h4>
          </div>
          <div className="notification-scrollable">
            {sortNotificationsByTime(user?.seennotification || []).map((notificationMgs) => (
              <div
                key={notificationMgs._id}
                className="notification-card"
                onClick={() => navigate(notificationMgs.onClickPath)}
              >
                <div className="card-header">
                  <p>Messages for You Doctor.</p>
                </div>
                <div className="card-body">
                  <p>{notificationMgs.message}</p>
                  <small>{new Date(notificationMgs.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
};

export default NotificationPage;
