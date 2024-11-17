import React, { useEffect } from "react";
import "./NotFound.css";

import doctor from '../../assest/Doctor.png'

const NotFound = () => {
  useEffect(() => {
    // Disable right-click on the page
    const handleRightClick = (event) => {
      event.preventDefault();
    };

    // Attach the event listener
    window.addEventListener('contextmenu', handleRightClick);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('contextmenu', handleRightClick);
    };
  }, []);

  return (
    <div className="not-found-container">
      <div className="text-container">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist.
        </p>
        <a href="/" className="home-link">Go Back Home</a>
      </div>
      <img className="doctor-image" src={doctor} alt="Doctor"/>
    </div>
  );
};

export default NotFound;
