import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import { Row, Modal, Input } from "antd";
import DoctorList from "../components/DoctorList";
import { LoadingButton } from '@mui/lab';
import Skeleton from '@mui/material/Skeleton';

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [currentDoctorEmail, setCurrentDoctorEmail] = useState(null); // State to hold logged-in doctor's email
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [specializationQuery, setSpecializationQuery] = useState("");
  console.log(`Timings of doctor: ${doctors?.[0]?.timings?.[0]} - ${doctors?.[0]?.timings?.[1]}`);

  

  const getAllDoctors = async () => {
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
        const allDoctors = res.data.data;
        const userToken = localStorage.getItem("token");
        const userId = decodeToken(userToken)?.id;

        // Find the current user's doctorId and email in the response
        const loggedInDoctor = allDoctors.find((doctor) => doctor.userId === userId);
        setCurrentDoctorId(loggedInDoctor?.id || null);
        setCurrentDoctorEmail(loggedInDoctor?.email || null); // Set logged-in doctor's email

        // Set doctors list
        setDoctors(allDoctors);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkDoctorLoginStatus = async () => {
    try {
      const res = await axios.get(
        "http://localhost:7000/api/v1/user/checkLoginStatus",
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      if (res.data.success) {
        setIsDoctorLoggedIn(true);
      } else {
        setIsDoctorLoggedIn(false);
      }
    } catch (error) {
      console.log("Error checking doctor login status:", error);
      setIsDoctorLoggedIn(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    getAllDoctors();
    checkDoctorLoginStatus();
  }, []);

  // Filter doctors excluding the one matching the current logged-in user's doctor ID
  const filteredDoctors = doctors.filter(
    (doctor) => doctor.id !== currentDoctorId
  );

  // Filter doctors by specialization query
  const searchDoctorsBySpecialization = (specialization) => {
    if (!specialization) return filteredDoctors;

    return filteredDoctors.filter(doctor => 
      doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  };

  // Handle search
  const handleSearch = () => {
    setSearchModalVisible(true);
  };

  const handleSearchModalOk = () => {
    setSearchModalVisible(false);
  };

  const handleSearchModalCancel = () => {
    setSearchModalVisible(false);
  };

  const handleSpecializationChange = (e) => {
    setSpecializationQuery(e.target.value);
  };

  return (
    <Layout>
      <div style={{ height: 'calc(100vh - 100px)', justifyContent:'center' }}>

        <h1 className="text-center">Doctor's</h1>

        {/* Search bar */}
        <div className="search-bar" style={{cursor:'pointer'}} onClick={handleSearch}>
          <input 
            type="text" 
            placeholder="Search..." 
            value={specializationQuery}
            onChange={handleSpecializationChange}
            style={{cursor:'pointer'}}
          />
          <button 
            className="search-button" 
            
          >
            <i className="fa-solid fa-search"></i>
          </button>
        </div>

        {/* Modal for search */}
        <Modal
          title="Search Doctors by Specialization"
          visible={searchModalVisible}
          onOk={handleSearchModalOk}
          onCancel={handleSearchModalCancel}
          footer={null}
        >
          <Input 
            placeholder="Enter specialization" 
            value={specializationQuery}
            onChange={handleSpecializationChange}
          />
          <Row 
            style={{ 
              justifyContent: 'center', 
              overflowY: 'auto', 
              maxHeight: '400px', 
              flexWrap: 'wrap', 
              display: 'flex' 
            }}
          >
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="card m-2"
                  style={{
                    cursor: 'pointer',
                    justifyContent: 'center',
                    flex: '1 0 48%', // This makes the card take 48% of the width of the row, so two cards fit per row
                  }}
                  key={index}
                >
                  <div
                    className="card-header"
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <LoadingButton />
                  </div>
                  <div className="card-body">
                    <p>
                      <Skeleton variant="rounded" width={180} height={35} />
                    </p>
                    <p>
                      <Skeleton variant="rounded" width={130} height={20} />
                    </p>
                    <p>
                      <Skeleton variant="rounded" width={180} height={30} />
                    </p>
                    <p>
                      <Skeleton variant="rounded" width={180} height={15} />
                    </p>
                  </div>
                </div>
              ))
            ) : (
              searchDoctorsBySpecialization(specializationQuery).length > 0 ? (
                searchDoctorsBySpecialization(specializationQuery).map((doctor) => (
                  <div 
                    className="card m-2" 
                    style={{
                      cursor: 'pointer', 
                      justifyContent: 'center', 
                      flex: '1 0 48%' // Adjust width to 48% for two cards per row
                    }}
                    key={doctor.id}
                  >
                    <DoctorList doctor={doctor} email={currentDoctorEmail} />
                  </div>
                ))
              ) : (
                <p>No doctors found for this specialization.</p>
              )
            )}
          </Row>
        </Modal>

        <Row>
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                className="card m-2"
                style={{ cursor: "pointer" }}
                key={index}
              >
                <div
                  className="card-header"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <LoadingButton />
                </div>
                <div className="card-body">
                  <p>
                    <Skeleton variant="rounded" width={180} height={35} />
                  </p>
                  <p>
                    <Skeleton variant="rounded" width={130} height={20} />
                  </p>
                  <p>
                    <Skeleton variant="rounded" width={180} height={30} />
                  </p>
                  <p>
                    <Skeleton variant="rounded" width={180} height={15} />
                  </p>
                </div>
              </div>
            ))
          ) : (
            filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <DoctorList key={doctor.id} doctor={doctor} email={currentDoctorEmail} />
              ))
            ) : (
              <p>No doctors available.</p>
            )
          )}
        </Row>
      </div>
    </Layout>
  );
};

export default HomePage;
