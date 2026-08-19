import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('available');
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [showStaffList, setShowStaffList] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedEventForOnDuty, setSelectedEventForOnDuty] = useState(null);
  const [onDutyRequests, setOnDutyRequests] = useState([]);

  useEffect(() => {
    fetchEvents();
    if (user) {
      fetchMyEvents();
      fetchOnDutyRequests();
    }
  }, [user, currentPage]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handlePrevious = () => currentPage > 0 && setCurrentPage(currentPage - 1);
  const handleNext = () => currentPage < totalPages - 1 && setCurrentPage(currentPage + 1);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/events?page=${currentPage}&size=2`);
      setEvents(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events');
      setEvents([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${user.userId}/events`);
      setMyEvents(response.data);
    } catch {
      setMyEvents([]);
    }
  };

  const fetchOnDutyRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/onduty/student/${user.userId}/requests`);
      setOnDutyRequests(response.data);
    } catch {
      setOnDutyRequests([]);
    }
  };

  const fetchStaffList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/onduty/staff');
      setStaffList(response.data);
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
    }
  };

  const handleApplyOnDuty = (event) => {
    setSelectedEventForOnDuty(event);
    fetchStaffList();
    setShowStaffList(true);
  };

  const submitOnDutyRequest = async (staffId) => {
    try {
      await axios.post('http://localhost:8080/api/onduty/request', {
        staffId,
        eventId: selectedEventForOnDuty.id
      });
      alert('On-duty request submitted successfully!');
      setShowStaffList(false);
      setSelectedEventForOnDuty(null);
      fetchOnDutyRequests();
    } catch (error) {
      alert(error.response?.data || 'Failed to submit on-duty request');
    }
  };

  const handleViewDetails = (event) => {
    setSelectedEventDetails(event);
    setShowEventDetails(true);
  };

  const handleRegister = (event) => {
    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const confirmRegistration = async () => {
    try {
      await axios.post(`http://localhost:8080/api/events/${selectedEvent.id}/register`);
      alert('Registration successful!');
      setShowRegistrationForm(false);
      setSelectedEvent(null);
      fetchEvents();
      fetchMyEvents();
    } catch (error) {
      alert(error.response?.data || 'Registration failed');
    }
  };

  const cancelRegistration = async (eventId) => {
    if (window.confirm('Are you sure you want to cancel this registration?')) {
      try {
        await axios.delete(`http://localhost:8080/api/events/${eventId}/cancel`);
        alert('Registration cancelled successfully!');
        fetchEvents();
        fetchMyEvents();
      } catch (error) {
        alert(error.response?.data || 'Failed to cancel registration');
      }
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatTime = (timeString) =>
    new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isRegistered = (eventId) => myEvents.some(reg => reg.event.id === eventId);
  const hasOnDutyRequest = (eventId) => onDutyRequests.some(req => req.event.id === eventId);
  const getOnDutyStatus = (eventId) => {
    const request = onDutyRequests.find(req => req.event.id === eventId);
    return request ? request.status : null;
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome, {user?.name}!</h1>

      {/* Tabs */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('available')}
          className={`btn ${activeTab === 'available' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ marginRight: '1rem' }}
        >
          Available Events
        </button>
        <button
          onClick={() => setActiveTab('registered')}
          className={`btn ${activeTab === 'registered' ? 'btn-primary' : 'btn-secondary'}`}
        >
          My Registrations
        </button>
      </div>

      {/* Available Events */}
      {activeTab === 'available' && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Available Events</h2>
          {events.length === 0 ? (
            <p style={{ textAlign: 'center' }}>No events available at the moment.</p>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {events.map(event => (
                  <div key={event.id} className="card">
                    <h3>{event.title}</h3>
                    <p><strong>Date:</strong> {formatDate(event.eventDate)}</p>
                    <p><strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                    <p><strong>Location:</strong> {event.location}</p>
                    <p>
                      <strong>Available:</strong>{" "}
                      {event.maxCapacity ? event.maxCapacity - event.registeredCount : 'Unlimited'} spots
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button onClick={() => handleViewDetails(event)} className="btn btn-secondary">
                        View Details
                      </button>
                      {isRegistered(event.id) ? (
                        <>
                          <button className="btn btn-success" disabled>Registered</button>
                          {hasOnDutyRequest(event.id) ? (
                            <button
                              className={`btn ${
                                getOnDutyStatus(event.id) === 'APPROVED'
                                  ? 'btn-success'
                                  : getOnDutyStatus(event.id) === 'REJECTED'
                                  ? 'btn-danger'
                                  : 'btn-info'
                              }`}
                              disabled
                            >
                              On-Duty: {getOnDutyStatus(event.id)}
                            </button>
                          ) : (
                            <button onClick={() => handleApplyOnDuty(event)} className="btn btn-info">
                              Apply On-Duty
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleRegister(event)}
                          className="btn btn-primary"
                          disabled={event.maxCapacity && event.registeredCount >= event.maxCapacity}
                        >
                          {event.maxCapacity && event.registeredCount >= event.maxCapacity ? 'Full' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ Fixed Pagination inside proper fragment */}
              {totalPages > 1 && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    className="btn btn-secondary"
                    style={{ marginRight: '1rem' }}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`btn ${currentPage === i ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ margin: '0 0.25rem' }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages - 1}
                    className="btn btn-secondary"
                    style={{ marginLeft: '1rem' }}
                  >
                    Next
                  </button>

                  <p style={{ marginTop: '1rem', color: '#666' }}>
                    Showing page {currentPage + 1} of {totalPages} ({totalElements} total events)
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Registered Events */}
      {activeTab === 'registered' && (
        <div>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>My Registrations</h2>
          {myEvents.length === 0 ? (
            <p style={{ textAlign: 'center' }}>You haven't registered for any events yet.</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {myEvents.map(registration => (
                <div key={registration.id} className="card">
                  <h3>{registration.event.title}</h3>
                  <p><strong>Date:</strong> {formatDate(registration.event.eventDate)}</p>
                  <p><strong>Time:</strong> {formatTime(registration.event.startTime)} - {formatTime(registration.event.endTime)}</p>
                  <p><strong>Location:</strong> {registration.event.location}</p>
                  <p><strong>Registered on:</strong> {new Date(registration.registrationDate).toLocaleDateString()}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color: registration.attended ? '#008000' : '#ff8800',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}
                    >
                      {registration.attended ? 'Attended' : 'Registered'}
                    </span>
                  </p>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    <button onClick={() => handleViewDetails(registration.event)} className="btn btn-secondary">
                      View Details
                    </button>
                    <button
                      onClick={() => cancelRegistration(registration.event.id)}
                      className="btn btn-danger"
                    >
                      Cancel Registration
                    </button>
                    {hasOnDutyRequest(registration.event.id) ? (
                      <button
                        className={`btn ${
                          getOnDutyStatus(registration.event.id) === 'APPROVED'
                            ? 'btn-success'
                            : getOnDutyStatus(registration.event.id) === 'REJECTED'
                            ? 'btn-danger'
                            : 'btn-info'
                        }`}
                        disabled
                      >
                        On-Duty: {getOnDutyStatus(registration.event.id)}
                      </button>
                    ) : (
                      <button onClick={() => handleApplyOnDuty(registration.event)} className="btn btn-info">
                        Apply On-Duty
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEventDetails && (
        <div className="overlay">
          <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
            <h2>{selectedEventDetails.title}</h2>
            <p><strong>Date:</strong> {formatDate(selectedEventDetails.eventDate)}</p>
            <p><strong>Time:</strong> {formatTime(selectedEventDetails.startTime)} - {formatTime(selectedEventDetails.endTime)}</p>
            <p><strong>Location:</strong> {selectedEventDetails.location}</p>
            <p><strong>Capacity:</strong> {selectedEventDetails.registeredCount}/{selectedEventDetails.maxCapacity || 'Unlimited'}</p>
            <p><strong>Status:</strong> {selectedEventDetails.status}</p>
            {selectedEventDetails.description && <p>{selectedEventDetails.description}</p>}

            <div style={{ display: 'flex', gap: '1rem' }}>
              {!isRegistered(selectedEventDetails.id) && (
                <button
                  onClick={() => {
                    setShowEventDetails(false);
                    handleRegister(selectedEventDetails);
                  }}
                  className="btn btn-primary"
                >
                  Register
                </button>
              )}
              <button onClick={() => setShowEventDetails(false)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationForm && selectedEvent && (
        <div className="overlay">
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2>Register for Event</h2>
            <p><strong>Event:</strong> {selectedEvent.title}</p>
            <p><strong>Date:</strong> {formatDate(selectedEvent.eventDate)}</p>
            <p><strong>Time:</strong> {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <p><strong>Student:</strong> {user.name} ({user.email})</p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={confirmRegistration} className="btn btn-primary">Confirm</button>
              <button onClick={() => setShowRegistrationForm(false)} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff List Modal */}
      {showStaffList && selectedEventForOnDuty && (
        <div className="overlay">
          <div className="card" style={{ maxWidth: '600px', width: '90%' }}>
            <h2>Select Staff for On-Duty</h2>
            <p><strong>Event:</strong> {selectedEventForOnDuty.title}</p>
            <p><strong>Date:</strong> {formatDate(selectedEventForOnDuty.eventDate)}</p>

            {staffList.length === 0 ? (
              <p>No staff available.</p>
            ) : (
              staffList.map(staff => (
                <div key={staff.id} className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                  <h4>{staff.name}</h4>
                  <p><strong>Email:</strong> {staff.email}</p>
                  <p><strong>ID:</strong> {staff.staffId}</p>
                  <button onClick={() => submitOnDutyRequest(staff.id)} className="btn btn-primary">
                    Apply to {staff.name}
                  </button>
                </div>
              ))
            )}

            <button onClick={() => setShowStaffList(false)} className="btn btn-secondary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
