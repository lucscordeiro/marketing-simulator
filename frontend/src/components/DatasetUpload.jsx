import React, { useState, useRef } from 'react';
import { datasetService } from '../services/api';
import '../styles/DatasetUpload.css';

function DatasetUpload({ projectId, onUpload, compact = false }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    if (!name) {
      setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('📤 Starting upload...', { projectId, name, file: file.name });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);

      // Simulate progress for better UX (actual implementation would use axios onUploadProgress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await datasetService.upload(projectId, formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('✅ Upload successful:', response.data);
      
      // Small delay to show 100% progress
      setTimeout(() => {
        if (onUpload) {
          onUpload();
        }
        
        // Reset form
        setFile(null);
        setName('');
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 500);

    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error details:', error.response?.data);
      alert(`Upload failed: ${error.response?.data?.error || error.message}`);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  if (compact) {
    return (
      <div className="dataset-upload-compact">
        <div className="compact-header">
          <h4>Upload Dataset</h4>
        </div>
        
        <form onSubmit={handleSubmit} className="compact-form">
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
              style={{ display: 'none' }}
            />
            
            <div className="upload-content">
              {file ? (
                <>
                  <div className="file-icon">📊</div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <strong>Click to browse</strong>
                    <span>or drag and drop CSV file</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {file && (
            <div className="form-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dataset name"
                className="form-input"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading || !file}
            className={`btn-primary ${uploading ? 'loading' : ''}`}
          >
            {uploading ? (
              <>
                <div className="button-spinner"></div>
                Uploading...
              </>
            ) : (
              'Upload Dataset'
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="dataset-upload">
      <div className="upload-header">
        <div className="header-content">
          <h3>Upload Dataset</h3>
          <p>Add your marketing data to train AI models and generate insights</p>
        </div>
        <div className="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dataset-name" className="form-label">
              Dataset Name *
            </label>
            <input
              id="dataset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="e.g., Customer Behavior Data Q4 2024"
              required
              disabled={uploading}
            />
            <div className="input-hint">
              Give your dataset a descriptive name
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              CSV File *
            </label>
            <div 
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                required
                className="file-input"
              />
              
              <div className="upload-content">
                {file ? (
                  <>
                    <div className="file-icon">📊</div>
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-details">
                        <span className="file-size">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <span className="file-type">CSV</span>
                        <span className="file-modified">
                          Modified: {new Date(file.lastModified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="change-file-btn"
                      onClick={handleBrowseClick}
                      disabled={uploading}
                    >
                      Change
                    </button>
                  </>
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="upload-text">
                      <h4>Drag and drop your CSV file</h4>
                      <p>or</p>
                      <button 
                        type="button"
                        className="browse-btn"
                        onClick={handleBrowseClick}
                      >
                        Browse Files
                      </button>
                    </div>
                    <div className="upload-requirements">
                      <span>Maximum file size: 50MB</span>
                      <span>Supported format: CSV</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  Uploading... {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="upload-info">
          <div className="info-card">
            <div className="info-icon">📋</div>
            <div className="info-content">
              <strong>CSV Format Requirements</strong>
              <span>First row should contain column headers, supported encodings: UTF-8</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <div className="info-content">
              <strong>Recommended Data</strong>
              <span>Include columns like: date, campaign, clicks, conversions, spend</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🔍</div>
            <div className="info-content">
              <strong>Data Quality</strong>
              <span>Clean, consistent data works best for accurate AI models</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={uploading || !file}
            className={`btn-primary ${uploading ? 'loading' : ''}`}
          >
            {uploading ? (
              <>
                <div className="button-spinner"></div>
                Uploading Dataset...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload Dataset
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DatasetUpload;