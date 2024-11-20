import React, { useState } from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message, Modal } from "antd";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  // console.log(user)
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Show logout confirmation modal
  const showLogoutModal = () => {
    setIsLogoutModalVisible(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
    setIsLogoutModalVisible(false);
  };

  // Handle cancel logout
  const handleCancel = () => {
    setIsLogoutModalVisible(false);
  };

  // Doctor menu
  const doctorMenu = [
    {
      name: "Home",
      path: "/",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    {
      name: "Profile Update",
      path: `/doctor/profile/${user?._id}`,
      icon: "fa-solid fa-user",
    },
  ];

  // Rendering menu list
  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  return (
    <>
      <div className="main">
        <nav className="navbar">
          <div className="logo">
            <h6 className="text-light">HealthCare</h6>
          </div>
          <ul className="menu">
            {SidebarMenu.map((menu, index) => {
              const isActive = location.pathname === menu.path;
              return (
                <li key={index} className={`menu-item ${isActive && "active"}`}>
                  <Link to={menu.path}>
                    <i className={menu.icon}></i>
                    {menu.name}
                  </Link>
                </li>
              );
            })}
            <li className="menu-item" onClick={showLogoutModal}>
              <a>
                <i className="fa-solid fa-right-from-bracket"></i>
                Logout
              </a>
            </li>

          </ul>
          <div className="header-content">
            <Badge
              count={user && user.notifcation.length}
              onClick={() => {
                navigate("/notification");
              }}
              className="notification-icon"
            >
              <i className="fa-solid fa-bell"></i>
            </Badge>
            <li className="profile-menu">
              
                <Link to="/Profile/:id">{user?.name}</Link>
              
            </li>
          </div>
        </nav>
        <div className="content">
          <div className="body">{children}</div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title="Confirm Logout"
        visible={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={handleCancel}
        centered
        okText="Yes, Logout"
        cancelText="Cancel"
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
      {/* Floating Search Bar */}
  {/* <div className="search-bar">
    <input type="text" placeholder="Search..." />
    <button className="search-button">
      <i className="fa-solid fa-search"></i>
    </button>
  </div> */}
    </>
  );
};

export default Layout;
