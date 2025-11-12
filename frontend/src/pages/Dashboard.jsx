import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectService } from '../services/api';
import '../styles/Dashboard.css'; // Arquivo CSS separado para estilos

function Dashboard() {
  const { data: projects, isLoading, error } = useQuery(
    'projects',
    () => projectService.getAll().then(res => res.data.projects),
    { staleTime: 5000 }
  );

  const recentProjects = projects?.slice(0, 3) || [];
  const totalProjects = projects?.length || 0;
  const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
  const totalBudget = projects?.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0) || 0;

  if (isLoading) return (
    <div className="dashboard-loading">
      <div className="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  );
  
  if (error) return (
    <div className="dashboard-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load dashboard</h3>
      <p>Please try refreshing the page</p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Retry
      </button>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Welcome to Your Dashboard</h1>
            <p>Here's an overview of your projects and activities</p>
          </div>
          <Link to="/projects" className="btn-primary">
            <span>Manage Projects</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon total-projects">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Projects</h3>
            <p className="stat-number">{totalProjects}</p>
            <span className="stat-trend">All time projects</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active-projects">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Active Projects</h3>
            <p className="stat-number">{activeProjects}</p>
            <span className="stat-trend">Currently in progress</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon budget">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Budget</h3>
            <p className="stat-number">${totalBudget.toLocaleString()}</p>
            <span className="stat-trend">Across all projects</span>
          </div>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="recent-projects-section">
        <div className="section-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="view-all-link">
            View All Projects
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="projects-grid">
            {recentProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3 className="project-title">{project.name}</h3>
                  <span className={`status-badge status-${project.status}`}>
                    {project.status}
                  </span>
                </div>
                <p className="project-description">
                  {project.description || 'No description provided'}
                </p>
                <div className="project-meta">
                  <div className="meta-item">
                    <span className="meta-label">Budget</span>
                    <span className="meta-value">
                      {project.budget ? `$${project.budget}` : 'Not set'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className="meta-value">{project.status}</span>
                  </div>
                </div>
                <div className="project-actions">
                  <Link to={`/projects/${project.id}`} className="btn-secondary">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <h3>No projects yet</h3>
            <p>Get started by creating your first project</p>
            <Link to="/projects" className="btn-primary">
              Create Project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;