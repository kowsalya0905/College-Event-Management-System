import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to={user ? "/dashboard" : "/"} className="navbar-brand">
        College Events
      </Link>
      <ul className="navbar-nav">
        {user ? (
          <>
            <li><Link to={user.role === 'ADMIN' ? '/admin' : user.role === 'STAFF' ? '/staff' : '/student'} className="nav-link">Dashboard</Link></li>
            <li><Link to="/events" className="nav-link">Events</Link></li>
            {user.role === 'STUDENT' && (
              <li><Link to="/my-events" className="nav-link">My Events</Link></li>
            )}
            {user.role === 'ADMIN' && (
              <li><Link to="/admin" className="nav-link">Manage Events</Link></li>
            )}
            {user.role === 'STAFF' && (
              <li><Link to="/staff" className="nav-link">On-Duty Requests</Link></li>
            )}
            <li><span className="nav-link">Welcome, {user.name} ({user.role})</span></li>
            <li><button onClick={logout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer'}}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/events" className="nav-link">Events</Link></li>
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/register" className="nav-link">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;