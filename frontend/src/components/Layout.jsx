import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Marketing Simulator</h2>
        </div>
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Dashboard</Link>
          <Link to="/projects" className={isActive('/projects')}>Projects</Link>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;