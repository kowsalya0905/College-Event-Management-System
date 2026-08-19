import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import StaffDashboard from './components/StaffDashboard';
import MyEvents from './components/MyEvents';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/events" element={<EventList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
              <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user && user.role === 'ADMIN' ? children : <Navigate to="/" />;
}

function StudentRoute({ children }) {
  const { user } = useAuth();
  return user && user.role === 'STUDENT' ? children : <Navigate to="/" />;
}

function StaffRoute({ children }) {
  const { user } = useAuth();
  return user && user.role === 'STAFF' ? children : <Navigate to="/" />;
}

function DashboardRoute() {
  const { user } = useAuth();
  
  if (!user) {
    return <EventList />;
  }
  
  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin" />;
    case 'STUDENT':
      return <Navigate to="/student" />;
    case 'STAFF':
      return <Navigate to="/staff" />;
    default:
      return <EventList />;
  }
}

export default App;