import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        fontWeight: 'bold'
      }}>
        SRI KRISHNA COLLEGE OF ENGINEERING & TECHNOLOGY
      </h1>
      
      <h2 style={{
        fontSize: '1.5rem',
        marginBottom: '3rem',
        color: '#666'
      }}>
        Event Management System
      </h2>
      
      <div style={{
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <Link to="/register" className="btn btn-primary" style={{
          fontSize: '1.2rem',
          padding: '1rem 2rem'
        }}>
          Register
        </Link>
        
        <Link to="/login" className="btn btn-secondary" style={{
          fontSize: '1.2rem',
          padding: '1rem 2rem'
        }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;