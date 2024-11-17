import React from "react";
import { useNavigate } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import { InfoCircleOutlined } from '@ant-design/icons'; // Import an icon for tooltip

const DoctorList = ({ doctor, email }) => {
  const navigate = useNavigate();

  // Check if the email matches
  const isDisabled = doctor.email === email;

  // Handle click: prevent if the doctor is disabled
  const handleClick = () => {
    if (isDisabled) {
      return;  // Prevent click if doctor email matches user email
    }
    navigate(`/doctor/book-appointment/${doctor._id}`);
  };

  return (
    <div style={{justifyContent:'center'}}>
    <Tooltip 
    title={
      isDisabled ? (
        <div style={{
          backgroundColor: '#e6f7ff', // Light blue background
          color: '#333', // Dark text color for contrast
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)', // Subtle shadow
          display: 'flex',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          <InfoCircleOutlined style={{ marginRight: 5, color: '#1890ff' }} />
          You cannot schedule an appointment with yourself.
        </div>
      ) : ""
    } // Tooltip message with icon
    placement="top" // Tooltip placement
    disabled={!isDisabled} // Disable tooltip if not disabled
    overlayStyle={{ padding: 0 }} // Remove default padding
  >
     <div
        className="card m-2"
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',  // Disable cursor if the email matches
          opacity: isDisabled ? 0.5 : 1, // Make the card look disabled if the email matches
          borderRadius: '8px', // Rounded corners
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow
          transition: 'transform 0.2s', // Smooth transition for hover effect
          justifyContent:'center'
          
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = 'scale(1.02)'; // Scale up on hover
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'; // Scale back down
        }}
      >
        <div className="card-header" style={{ backgroundColor: '#f0f2f5', padding: '10px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <strong>Dr. {doctor.firstName} {doctor.lastName}</strong>
        </div>
        <div className="card-body" style={{ padding: '15px' }}>
          <p>
            <b>Specialization:</b> {doctor.specialization}
          </p>
          <p>
            <b>Experience:</b> {doctor.experience} years
          </p>
          <p>
            <b>Fees Per Consultation:</b> ${doctor.feesPerCunsaltation}
          </p>
          <p>
            <b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}
          </p>
        </div>
      </div>
    </Tooltip>
     </div>
  );
};

export default DoctorList;