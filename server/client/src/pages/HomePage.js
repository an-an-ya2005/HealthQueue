import React from 'react';
import Layout from '../components/Layout';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import img from '../assest/pexels-tara-winstead-7723510.jpg'; // Ensure the path is correct
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';


export default function HomePage() {
  return (
    <Layout>
      <div
        style={{
          height: 'calc(100vh - 100px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          backgroundImage: `url(${img})`, // Correct way to set background image
          backgroundSize: 'cover', // Ensures the image covers the entire container
          backgroundPosition: 'center', // Centers the image
          backgroundRepeat: 'no-repeat', // Prevents the image from repeating
        }}
      >
        <h2 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', alignItems: 'center' }}>
          HEALING STARTS HERE
          <LocalHospitalIcon sx={{ fontSize: '50px', marginLeft: '10px' }} />
        </h2>
        <h3 style={{ fontSize: '1.5rem', color: '#fff' }}> {/* Changed color for better contrast */}
          Your health and healing is our top most priority!
        </h3>
        {/* <Link to={'/allDoctor'}>
            <Button variant='outlined' size='large' >Doctor</Button>
        </Link> */}
      </div>
    </Layout>
  );
}
