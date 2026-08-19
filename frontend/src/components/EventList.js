import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('eventDate');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [sortBy, sortDir, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/events?page=${currentPage}&size=2&sortBy=${sortBy}&sortDir=${sortDir}`);
      setEvents(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      setError('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
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

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>College Events</h1>
      
      <div style={{marginBottom: '2rem', textAlign: 'center'}}>
        <label style={{marginRight: '1rem'}}>Sort by: </label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{marginRight: '1rem', padding: '0.5rem'}}
        >
          <option value="eventDate">Date</option>
          <option value="title">Title</option>
          <option value="registeredCount">Popularity</option>
        </select>
        
        <select 
          value={sortDir} 
          onChange={(e) => setSortDir(e.target.value)}
          style={{padding: '0.5rem'}}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
      
      {!Array.isArray(events) || events.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <p>No events available at the moment.</p>
        </div>
      ) : (
        <div className="grid">
          {Array.isArray(events) && events.map(event => (
            <div key={event.id} className="card">
              <h3 className="card-title">{event.title}</h3>
              <p className="card-text">
                <strong>Date:</strong> {formatDate(event.eventDate)}
              </p>
              <p className="card-text">
                <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </p>
              <p className="card-text">
                <strong>Location:</strong> {event.location}
              </p>
              <p className="card-text">
                <strong>Capacity:</strong> {event.registeredCount}/{event.maxCapacity || 'Unlimited'}
              </p>
              {event.description && (
                <p className="card-text">
                  {event.description.length > 100 
                    ? `${event.description.substring(0, 100)}...` 
                    : event.description
                  }
                </p>
              )}
              <Link to={`/events/${event.id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <button 
            onClick={handlePrevious} 
            disabled={currentPage === 0}
            className="btn btn-secondary"
            style={{marginRight: '1rem'}}
          >
            Previous
          </button>
          
          {Array.from({length: totalPages}, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`btn ${currentPage === i ? 'btn-primary' : 'btn-secondary'}`}
              style={{margin: '0 0.25rem'}}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            onClick={handleNext} 
            disabled={currentPage === totalPages - 1}
            className="btn btn-secondary"
            style={{marginLeft: '1rem'}}
          >
            Next
          </button>
          
          <p style={{marginTop: '1rem', color: '#666'}}>
            Showing page {currentPage + 1} of {totalPages} ({totalElements} total events)
          </p>
        </div>
      )}
    </div>
  );
};

export default EventList;