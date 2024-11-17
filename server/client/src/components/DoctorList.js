import React from "react";
import { useNavigate } from "react-router-dom";

const DoctorList = ({ doctor, userEmail }) => {
  const navigate = useNavigate();

  // Check if the email matches
  const isDisabled = doctor.email === userEmail;

  // Handle click: prevent if the doctor is disabled
  const handleClick = () => {
    if (isDisabled) {
      return;  // Prevent click if doctor email matches user email
    }
    navigate(`/doctor/book-appointment/${doctor._id}`);
  };

  return (
    <>
      <div
        className="card m-2"
        style={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',  // Disable cursor if the email matches
          opacity: isDisabled ? 0.5 : 1, // Make the card look disabled if the email matches
        }}
        onClick={handleClick}
      >
        <div className="card-header">
          Dr. {doctor.firstName} {doctor.lastName}
        </div>
        <div className="card-body">
          <p>
            <b>Specialization:</b> {doctor.specialization}
          </p>
          <p>
            <b>Experience:</b> {doctor.experience}
          </p>
          <p>
            <b>Fees Per Consultation:</b> {doctor.feesPerCunsaltation}
          </p>
          <p>
            <b>Timings:</b> {doctor.timings[0]} - {doctor.timings[1]}
          </p>
        </div>
      </div>
    </>
  );
};

export default DoctorList;
