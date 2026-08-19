import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/onduty/staff/${user.userId}/requests`);
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (window.confirm('Are you sure you want to approve this on-duty request?')) {
      try {
        await axios.put(`http://localhost:8080/api/onduty/${requestId}/approve`);
        alert('Request approved successfully!');
        fetchRequests();
      } catch (error) {
        alert(error.response?.data || 'Failed to approve request');
      }
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setShowRejectForm(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/onduty/${selectedRequest.id}/reject`, {
        reason: rejectionReason
      });
      alert('Request rejected successfully!');
      setShowRejectForm(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      alert(error.response?.data || 'Failed to reject request');
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
      <h1 style={{textAlign: 'center', marginBottom: '2rem'}}>
        Staff Dashboard - {user?.name}
      </h1>

      <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>On-Duty Requests</h2>

      {requests.length === 0 ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <p>No on-duty requests found.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem'}}>
          {requests.map(request => (
            <div key={request.id} className="card">
              <h3 style={{marginBottom: '1rem', color: request.status === 'APPROVED' ? '#008000' : request.status === 'REJECTED' ? '#ff0000' : '#ff8800'}}>
                {request.event.title}
              </h3>
              
              <div style={{marginBottom: '1rem'}}>
                <p><strong>Student:</strong> {request.student.name}</p>
                <p><strong>Student ID:</strong> {request.student.studentId}</p>
                <p><strong>Email:</strong> {request.student.email}</p>
                <p><strong>Event Date:</strong> {formatDate(request.event.eventDate)}</p>
                <p><strong>Event Time:</strong> {formatTime(request.event.startTime)} - {formatTime(request.event.endTime)}</p>
                <p><strong>Location:</strong> {request.event.location}</p>
                <p><strong>Request Date:</strong> {new Date(request.requestDate).toLocaleString()}</p>
                <p><strong>Status:</strong> 
                  <span style={{
                    color: request.status === 'APPROVED' ? '#008000' : request.status === 'REJECTED' ? '#ff0000' : '#ff8800',
                    fontWeight: 'bold',
                    marginLeft: '0.5rem'
                  }}>
                    {request.status}
                  </span>
                </p>
                {request.rejectionReason && (
                  <p><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
                )}
              </div>

              {request.status === 'PENDING' && (
                <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
                  <button 
                    onClick={() => handleApprove(request.id)} 
                    className="btn btn-success"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(request)} 
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showRejectForm && selectedRequest && (
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
          <div className="card" style={{maxWidth: '500px', width: '90%'}}>
            <h2>Reject On-Duty Request</h2>
            <div style={{marginBottom: '1rem'}}>
              <p><strong>Student:</strong> {selectedRequest.student.name}</p>
              <p><strong>Event:</strong> {selectedRequest.event.title}</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Reason for Rejection:</label>
              <textarea
                className="form-textarea"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="4"
                placeholder="Please provide a reason for rejecting this request..."
                required
              />
            </div>
            
            <div style={{display: 'flex', gap: '1rem'}}>
              <button onClick={submitRejection} className="btn btn-danger">
                Send Rejection
              </button>
              <button 
                onClick={() => {
                  setShowRejectForm(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;