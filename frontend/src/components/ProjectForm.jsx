import React, { useState } from 'react';
import '../styles/ProjectForm.css';

function ProjectForm({ onSubmit, onCancel, loading, initialData }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    objective: initialData?.objective || '',
    budget: initialData?.budget || '',
    status: initialData?.status || 'active'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        objective: formData.objective.trim(),
        budget: formData.budget ? parseFloat(formData.budget) : null
      };
      onSubmit(submitData);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="project-form-modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>{initialData ? 'Edit Project' : 'Create New Project'}</h2>
            <p>
              {initialData 
                ? 'Update your project details and settings' 
                : 'Set up a new marketing simulation project'
              }
            </p>
          </div>
          <button 
            className="close-button"
            onClick={onCancel}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="project-name" className="form-label">
                Project Name *
              </label>
              <input
                id="project-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter project name"
                required
                disabled={loading}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="project-status" className="form-label">
                Status
              </label>
              <select
                id="project-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="project-description" className="form-label">
                Description
              </label>
              <textarea
                id="project-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Describe your project goals and scope..."
                rows="3"
                disabled={loading}
              />
              <div className="character-count">
                {formData.description.length}/500
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="project-objective" className="form-label">
                Business Objective
              </label>
              <input
                id="project-objective"
                type="text"
                name="objective"
                value={formData.objective}
                onChange={handleChange}
                className="form-input"
                placeholder="What do you want to achieve with this project?"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-budget" className="form-label">
                Budget (USD)
              </label>
              <div className="input-with-icon">
                <span className="input-icon">$</span>
                <input
                  id="project-budget"
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`form-input ${errors.budget ? 'error' : ''}`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={loading}
                />
              </div>
              {errors.budget && <span className="error-message">{errors.budget}</span>}
              <div className="input-hint">
                Leave empty if budget is not applicable
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="button-spinner"></div>
                  {initialData ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                initialData ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;