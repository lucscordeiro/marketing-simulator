import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectService } from '../services/api';
import ProjectForm from '../components/ProjectForm';
import { Link } from 'react-router-dom';
import '../styles/Projects.css';

function Projects() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery(
    'projects',
    () => projectService.getAll().then(res => res.data.projects)
  );

  const createMutation = useMutation(
    (projectData) => projectService.create(projectData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
        setShowForm(false);
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => projectService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects');
      }
    }
  );

  // Filter projects based on search and status
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) return (
    <div className="projects-loading">
      <div className="loading-spinner"></div>
      <p>Loading your projects...</p>
    </div>
  );

  if (error) return (
    <div className="projects-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load projects</h3>
      <p>Please try refreshing the page</p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Retry
      </button>
    </div>
  );

  return (
    <div className="projects-page">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Projects</h1>
            <p>Manage your marketing simulation projects</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Project
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="projects-toolbar">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="projects-stats">
          <span className="stat">
            {filteredProjects?.length || 0} of {projects?.length || 0} projects
          </span>
        </div>
      </div>

      {/* Project Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm
              onSubmit={createMutation.mutate}
              onCancel={() => setShowForm(false)}
              loading={createMutation.isLoading}
            />
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="projects-container">
        {filteredProjects?.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <div className="project-title-section">
                    <h3 className="project-title">{project.name}</h3>
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="project-menu">
                    <button className="menu-trigger">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <p className="project-description">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="project-meta">
                  <div className="meta-item">
                    <span className="meta-label">Budget</span>
                    <span className="meta-value">
                      {project.budget ? `$${parseFloat(project.budget).toLocaleString()}` : 'Not set'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Created</span>
                    <span className="meta-value">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {project.updated_at && (
                    <div className="meta-item">
                      <span className="meta-label">Updated</span>
                      <span className="meta-value">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="project-actions">
                  <Link to={`/projects/${project.id}`} className="btn-secondary">
                    View Details
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                        deleteMutation.mutate(project.id);
                      }
                    }}
                    disabled={deleteMutation.isLoading}
                  >
                    {deleteMutation.isLoading ? (
                      <div className="mini-spinner"></div>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                      </svg>
                    )}
                    Delete
                  </button>
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
            <h3>No projects found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started with marketing simulations'
              }
            </p>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;