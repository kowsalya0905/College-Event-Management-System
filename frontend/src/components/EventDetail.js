import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setMessage('');

    try {
      await axios.post(`http://localhost:8080/api/events/${id}/register`);
      setMessage('Successfully registered for the event!');
      fetchEvent(); // Refresh event data
    } catch (error) {
      setMessage(error.response?.data || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading event details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!event) return <div className="alert alert-error">Event not found</div>;

  const isEventFull = event.maxCapacity && event.registeredCount >= event.maxCapacity;

  return (
    <div style={{maxWidth: '800px', margin: '0 auto'}}>
      <button onClick={() => {
        if (user?.role === 'ADMIN') {
          navigate('/admin');
        } else if (user?.role === 'STAFF') {
          navigate('/staff');
        } else {
          navigate('/events');
        }
      }} className="btn btn-secondary" style={{marginBottom: '1rem'}}>
        ← Back to Events
      </button>
      
      <div className="card">
        <h1 className="card-title" style={{fontSize: '2rem', marginBottom: '1rem'}}>
          {event.title}
        </h1>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem'}}>
          <div>
            <p className="card-text">
              <strong>Date:</strong> {formatDate(event.eventDate)}
            </p>
            <p className="card-text">
              <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </p>
          </div>
          <div>
            <p className="card-text">
              <strong>Location:</strong> {event.location}
            </p>
            <p className="card-text">
              <strong>Capacity:</strong> {event.registeredCount}/{event.maxCapacity || 'Unlimited'}
            </p>
          </div>
        </div>
        
        {event.description && (
          <div style={{marginBottom: '1.5rem'}}>
            <h3>Description</h3>
            <p className="card-text" style={{whiteSpace: 'pre-wrap'}}>
              {event.description}
            </p>
          </div>
        )}
        
        {message && (
          <div className={`alert ${message.includes('Success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}
        
        {user && user.role === 'STUDENT' && (
          <div>
            {isEventFull ? (
              <button className="btn btn-secondary" disabled>
                Event Full
              </button>
            ) : (
              <button 
                onClick={handleRegister} 
                className="btn btn-primary"
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </button>
            )}
          </div>
        )}
        
        {!user && (
          <div>
            <p>Please <button onClick={() => navigate('/login')} className="btn btn-primary">login</button> to register for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;