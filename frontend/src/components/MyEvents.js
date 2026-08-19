import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyEvents = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyEvents = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${user.userId}/events`);
      setRegistrations(response.data);
    } catch (error) {
      setError('Failed to fetch your events');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString();
  };

  if (loading) return <div className="loading">Loading your events...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>My Registered Events</h1>
      
      {registrations.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <p>{user.role === 'GUEST' ? 'Guests cannot register for events.' : 'You haven\'t registered for any events yet.'}</p>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>
      ) : (
        <div className="grid">
          {registrations.map(registration => (
            <div key={registration.id} className="card">
              <h3 className="card-title">{registration.event.title}</h3>
              <p className="card-text">
                <strong>Date:</strong> {formatDate(registration.event.eventDate)}
              </p>
              <p className="card-text">
                <strong>Time:</strong> {formatTime(registration.event.startTime)} - {formatTime(registration.event.endTime)}
              </p>
              <p className="card-text">
                <strong>Location:</strong> {registration.event.location}
              </p>
              <p className="card-text">
                <strong>Registered on:</strong> {formatDateTime(registration.registrationDate)}
              </p>
              <p className="card-text">
                <strong>Status:</strong> 
                <span style={{
                  color: registration.attended ? '#008000' : '#ff8800',
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}>
                  {registration.attended ? 'Attended' : 'Registered'}
                </span>
              </p>
              {registration.event.description && (
                <p className="card-text">
                  {registration.event.description.length > 100 
                    ? `${registration.event.description.substring(0, 100)}...` 
                    : registration.event.description
                  }
                </p>
              )}
              <Link to={`/events/${registration.event.id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;