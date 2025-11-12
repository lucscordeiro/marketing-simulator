import React, { useState } from 'react';
import { aiService } from '../services/api';
import '../styles/AITraining.css';

function AITraining({ projectId, datasets, onTrain, compact = false }) {
  const [training, setTraining] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelType, setModelType] = useState('regression');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const modelTypes = [
    { value: 'regression', label: 'Regression', description: 'Predict continuous values (e.g., revenue, conversion rates)' },
    { value: 'classification', label: 'Classification', description: 'Categorize data (e.g., customer segments, campaign success)' },
    { value: 'clustering', label: 'Clustering', description: 'Group similar data points (e.g., customer behavior patterns)' },
    { value: 'time_series', label: 'Time Series', description: 'Forecast future trends (e.g., sales predictions)' }
  ];

  const handleTrain = async (e) => {
    e.preventDefault();
    if (!selectedDataset) return;

    setTraining(true);
    try {
      await aiService.trainModel(projectId, selectedDataset, {
        modelName: modelName || `Marketing Model ${new Date().toLocaleDateString()}`,
        modelType
      });
      onTrain();
      // Reset form
      setSelectedDataset('');
      setModelName('');
      setModelType('regression');
      setAdvancedOpen(false);
    } catch (error) {
      console.error('Training error:', error);
      alert('Error starting model training. Please try again.');
    } finally {
      setTraining(false);
    }
  };

  const selectedDatasetInfo = datasets.find(d => d.id === selectedDataset);

  if (compact) {
    return (
      <div className="ai-training-compact">
        <div className="compact-header">
          <h4>Train AI Model</h4>
          <button 
            type="button"
            className="btn-text"
            onClick={() => setAdvancedOpen(!advancedOpen)}
          >
            {advancedOpen ? 'Simple' : 'Advanced'}
          </button>
        </div>
        
        <form onSubmit={handleTrain} className="compact-form">
          <div className="form-row">
            <div className="form-group">
              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                required
                className="form-input"
              >
                <option value="">Select dataset</option>
                {datasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={training || !selectedDataset}
              className="btn-primary"
            >
              {training ? (
                <>
                  <div className="button-spinner"></div>
                  Training...
                </>
              ) : (
                'Train Model'
              )}
            </button>
          </div>

          {advancedOpen && (
            <div className="advanced-options">
              <div className="form-group">
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Model name (optional)"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="form-input"
                >
                  {modelTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="ai-training">
      <div className="training-header">
        <div className="header-content">
          <h3>Train AI Model</h3>
          <p>Create a machine learning model from your dataset to generate insights and predictions</p>
        </div>
        <div className="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2a10 10 0 0 1 7.38 16.75A10 10 0 0 1 12 2z"/>
            <path d="M12 8v4l2 2"/>
            <path d="M16 12h2"/>
            <path d="M12 16v2"/>
            <path d="M12 20v2"/>
          </svg>
        </div>
      </div>

      <form onSubmit={handleTrain} className="training-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="dataset-select" className="form-label">
              Training Dataset *
            </label>
            <select
              id="dataset-select"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="form-input"
              required
              disabled={training}
            >
              <option value="">Choose a dataset...</option>
              {datasets.map(dataset => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name} • {dataset.row_count?.toLocaleString()} rows • {(dataset.file_size / 1024 / 1024).toFixed(1)} MB
                </option>
              ))}
            </select>
            {selectedDatasetInfo && (
              <div className="dataset-preview">
                <div className="preview-header">
                  <span className="preview-title">Dataset Preview</span>
                  <span className="preview-rows">{selectedDatasetInfo.row_count?.toLocaleString()} rows</span>
                </div>
                <div className="preview-info">
                  <span>File: {selectedDatasetInfo.file_name}</span>
                  <span>Size: {(selectedDatasetInfo.file_size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="model-name" className="form-label">
              Model Name
            </label>
            <input
              id="model-name"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="form-input"
              placeholder="e.g., Customer Conversion Predictor"
              disabled={training}
            />
            <div className="input-hint">
              Leave empty for auto-generated name
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="model-type" className="form-label">
              Model Type *
            </label>
            <div className="model-type-selector">
              {modelTypes.map(type => (
                <label key={type.value} className="model-type-option">
                  <input
                    type="radio"
                    name="modelType"
                    value={type.value}
                    checked={modelType === type.value}
                    onChange={(e) => setModelType(e.target.value)}
                    disabled={training}
                  />
                  <div className="option-content">
                    <span className="option-title">{type.label}</span>
                    <span className="option-description">{type.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="training-info">
          <div className="info-card">
            <div className="info-icon">⏱️</div>
            <div className="info-content">
              <strong>Training Time</strong>
              <span>Typically 2-10 minutes depending on dataset size</span>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">💾</div>
            <div className="info-content">
              <strong>Data Requirements</strong>
              <span>Minimum 100 rows recommended for accurate models</span>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={training || !selectedDataset}
            className={`btn-primary ${training ? 'loading' : ''}`}
          >
            {training ? (
              <>
                <div className="button-spinner"></div>
                Training Model...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 12a10 10 0 0 0-19-7"/>
                  <path d="M2 12a10 10 0 0 0 19 7"/>
                  <path d="M12 2v20"/>
                </svg>
                Start Model Training
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AITraining;