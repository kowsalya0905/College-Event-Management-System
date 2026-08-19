import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    maxCapacity: '',
    status: 'DRAFT'
  });
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [showOnDutyRequests, setShowOnDutyRequests] = useState(false);
  const [onDutyRequests, setOnDutyRequests] = useState([]);

  useEffect(() => {
    fetchAllEvents();
    // Auto-refresh every 30 seconds to show real-time updates
    const interval = setInterval(fetchAllEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllEvents = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/events/admin/all');
      setEvents(response.data || []);
    } catch (error) {
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(`http://localhost:8080/api/events/${editingEvent.id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/events', formData);
      }
      
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      fetchAllEvents();
    } catch (error) {
      setError(error.response?.data || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      maxCapacity: event.maxCapacity || '',
      status: event.status
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`http://localhost:8080/api/events/${eventId}`);
        fetchAllEvents();
      } catch (error) {
        setError('Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      location: '',
      maxCapacity: '',
      status: 'DRAFT'
    });
  };

  const viewRegistrations = async (eventId) => {
    try {
      const [registrationsResponse, onDutyResponse] = await Promise.all([
        axios.get(`http://localhost:8080/api/events/${eventId}/registrations`),
        axios.get(`http://localhost:8080/api/onduty/event/${eventId}/requests`)
      ]);
      
      const event = events.find(e => e.id === eventId);
      
      // Merge registration data with on-duty status
      const registrationsWithOnDuty = registrationsResponse.data.map(registration => {
        const onDutyRequest = onDutyResponse.data.find(req => req.student.id === registration.student.id);
        return {
          ...registration,
          onDutyStatus: onDutyRequest ? onDutyRequest.status : 'NO_REQUEST',
          rejectionReason: onDutyRequest?.rejectionReason || null
        };
      });
      
      setRegistrations(registrationsWithOnDuty);
      setSelectedEventTitle(event?.title || 'Event');
      setShowRegistrations(true);
      fetchAllEvents();
    } catch (error) {
      setError('Failed to fetch registrations');
    }
  };

  const viewOnDutyRequests = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/onduty/event/${eventId}/requests`);
      const event = events.find(e => e.id === eventId);
      setOnDutyRequests(response.data);
      setSelectedEventTitle(event?.title || 'Event');
      setShowOnDutyRequests(true);
    } catch (error) {
      setError('Failed to fetch on-duty requests');
    }
  };

  const removeStudentFromEvent = async (eventId, studentId) => {
    if (window.confirm('Are you sure you want to remove this student from the event? This action cannot be undone.')) {
      try {
        const response = await axios.post(`http://localhost:8080/api/events/${eventId}/remove-student/${studentId}`);
        alert('Student removed from event successfully!');
        fetchAllEvents();
        // Refresh current view
        const currentEventId = events.find(e => e.title === selectedEventTitle)?.id;
        if (currentEventId) {
          if (showRegistrations) {
            viewRegistrations(currentEventId);
          }
          if (showOnDutyRequests) {
            viewOnDutyRequests(currentEventId);
          }
        }
      } catch (error) {
        console.error('Remove student error:', error);
        const errorMessage = typeof error.response?.data === 'string' 
          ? error.response.data 
          : error.response?.data?.message || error.message || 'Failed to remove student from event';
        alert(errorMessage);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>Admin Dashboard</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div style={{marginBottom: '2rem', textAlign: 'center'}}>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingEvent(null);
            resetForm();
          }} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Create New Event'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h2>{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem'}}>
              <div className="form-group">
                <label className="form-label">Title:</label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location:</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Event Date:</label>
                <input
                  type="date"
                  name="eventDate"
                  className="form-input"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Start Time:</label>
                <input
                  type="time"
                  name="startTime"
                  className="form-input"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">End Time:</label>
                <input
                  type="time"
                  name="endTime"
                  className="form-input"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Capacity:</label>
                <input
                  type="number"
                  name="maxCapacity"
                  className="form-input"
                  value={formData.maxCapacity}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Status:</label>
                <select
                  name="status"
                  className="form-input"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description:</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className="btn btn-primary">
                {editingEvent ? 'Update Event' : 'Create Event'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  resetForm();
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>All Events</h2>
        {events.length === 0 ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <p>No events found. Create your first event!</p>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem'}}>
            {events.map(event => (
              <div key={event.id} className="card">
                <h3 style={{marginBottom: '1rem', color: event.status === 'PUBLISHED' ? '#008000' : event.status === 'DRAFT' ? '#ff8800' : '#666'}}>
                  {event.title}
                </h3>
                <p><strong>Date:</strong> {formatDate(event.eventDate)}</p>
                <p><strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Registered:</strong> {event.registeredCount}/{event.maxCapacity || '∞'}</p>
                <p><strong>Status:</strong> <span style={{fontWeight: 'bold', color: event.status === 'PUBLISHED' ? '#008000' : event.status === 'DRAFT' ? '#ff8800' : '#666'}}>{event.status}</span></p>
                
                <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap'}}>
                  <button 
                    onClick={() => window.open(`/events/${event.id}`, '_blank')} 
                    className="btn btn-primary"
                    style={{fontSize: '0.9rem'}}
                  >
                    View
                  </button>
                  <button 
                    onClick={() => viewRegistrations(event.id)} 
                    className="btn btn-info"
                    style={{fontSize: '0.9rem'}}
                  >
                    Registrations ({event.registeredCount})
                  </button>
                  <button 
                    onClick={() => viewOnDutyRequests(event.id)} 
                    className="btn btn-secondary"
                    style={{fontSize: '0.9rem'}}
                  >
                    On-Duty Requests
                  </button>
                  <button 
                    onClick={() => handleEdit(event)} 
                    className="btn btn-secondary"
                    style={{fontSize: '0.9rem'}}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)} 
                    className="btn btn-danger"
                    style={{fontSize: '0.9rem'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRegistrations && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{maxWidth: '800px', width: '90%', maxHeight: '80vh', overflow: 'auto'}}>
            <h2>Registrations for {selectedEventTitle}</h2>
            
            {registrations.length === 0 ? (
              <p>No registrations found for this event.</p>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Email</th>
                      <th>Registration Date</th>
                      <th>On-Duty Status</th>
                      <th>Attended</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(registration => (
                      <tr key={registration.id}>
                        <td>{registration.student.name}</td>
                        <td>{registration.student.studentId}</td>
                        <td>{registration.student.email}</td>
                        <td>{new Date(registration.registrationDate).toLocaleString()}</td>
                        <td>
                          <span style={{
                            color: registration.onDutyStatus === 'APPROVED' ? '#008000' : 
                                   registration.onDutyStatus === 'REJECTED' ? '#ff0000' : 
                                   registration.onDutyStatus === 'PENDING' ? '#ff8800' : '#666666',
                            fontWeight: 'bold'
                          }}>
                            {registration.onDutyStatus === 'NO_REQUEST' ? 'Not Applied' : registration.onDutyStatus}
                          </span>
                          {registration.rejectionReason && (
                            <div style={{fontSize: '0.8rem', color: '#ff0000', marginTop: '0.25rem'}}>
                              Reason: {registration.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            color: registration.attended ? '#008000' : '#ff8800',
                            fontWeight: 'bold'
                          }}>
                            {registration.attended ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          {registration.onDutyStatus === 'REJECTED' && (
                            <button 
                              onClick={() => removeStudentFromEvent(registration.event.id, registration.student.id)} 
                              className="btn btn-danger"
                              style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{marginTop: '1rem'}}>
              <button 
                onClick={() => setShowRegistrations(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showOnDutyRequests && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{maxWidth: '900px', width: '90%', maxHeight: '80vh', overflow: 'auto'}}>
            <h2>On-Duty Requests for {selectedEventTitle}</h2>
            
            {onDutyRequests.length === 0 ? (
              <p>No on-duty requests found for this event.</p>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Staff</th>
                      <th>Request Date</th>
                      <th>Status</th>
                      <th>Rejection Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onDutyRequests.map(request => (
                      <tr key={request.id}>
                        <td>{request.student.name}</td>
                        <td>{request.student.studentId}</td>
                        <td>{request.staff.name}</td>
                        <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                        <td>
                          <span style={{
                            color: request.status === 'APPROVED' ? '#008000' : request.status === 'REJECTED' ? '#ff0000' : '#ff8800',
                            fontWeight: 'bold'
                          }}>
                            {request.status}
                          </span>
                        </td>
                        <td>{request.rejectionReason || '-'}</td>
                        <td>
                          {request.status === 'REJECTED' && (
                            <button 
                              onClick={() => removeStudentFromEvent(request.event.id, request.student.id)} 
                              className="btn btn-danger"
                              style={{fontSize: '0.8rem', padding: '0.25rem 0.5rem'}}
                            >
                              Remove Student
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div style={{marginTop: '1rem'}}>
              <button 
                onClick={() => setShowOnDutyRequests(false)} 
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;