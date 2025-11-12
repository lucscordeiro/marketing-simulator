import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectService, datasetService, aiService } from '../services/api';
import DatasetUpload from '../components/DatasetUpload';
import AITraining from '../components/AITraining';
import ProjectAnalysis from '../components/ai/ProjectAnalysis';
import AIChat from '../components/ai/AIChat';
import CampaignPredictor from '../components/ai/CampaignPredictor';
import '../styles/ProjectDetail.css';

function ProjectDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'datasets', label: 'Datasets', icon: '📁' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: '🤖' },
    { id: 'ai-chat', label: 'AI Chat', icon: '💬' },
    { id: 'ai-predict', label: 'Predictions', icon: '🔮' },
    { id: 'models', label: 'AI Models', icon: '🧠' },
    { id: 'simulations', label: 'Simulations', icon: '⚡' }
  ];

  const { data: projectData, isLoading, error } = useQuery(
    ['project', id],
    () => projectService.getById(id).then(res => res.data.project)
  );

  const { data: datasets } = useQuery(
    ['datasets', id],
    () => datasetService.getByProject(id).then(res => res.data.datasets),
    { enabled: !!projectData }
  );

  const { data: models } = useQuery(
    ['models', id],
    () => aiService.getModels(id).then(res => res.data.models),
    { enabled: !!projectData }
  );

  const { data: simulations } = useQuery(
    ['simulations', id],
    () => aiService.getSimulations(id).then(res => res.data.simulations),
    { enabled: !!projectData }
  );

  const simulateMutation = useMutation(
    ({ modelId, parameters }) => aiService.simulate(id, modelId, parameters),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['simulations', id]);
      }
    }
  );

  const handleSimulate = (modelId) => {
    simulateMutation.mutate({
      modelId,
      parameters: {
        name: `Simulation for ${projectData.name}`,
        budget: projectData.budget || 1000,
        channels: ['social', 'email', 'search']
      }
    });
  };

  if (isLoading) return (
    <div className="project-loading">
      <div className="loading-spinner"></div>
      <p>Loading project details...</p>
    </div>
  );

  if (error) return (
    <div className="project-error">
      <div className="error-icon">⚠️</div>
      <h3>Unable to load project</h3>
      <p>Please try refreshing the page</p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Retry
      </button>
    </div>
  );

  if (!projectData) return (
    <div className="project-not-found">
      <h2>Project not found</h2>
      <p>The project you're looking for doesn't exist or you don't have access.</p>
    </div>
  );

  return (
    <div className="project-detail">
      {/* Header Section */}
      <div className="project-header">
        <div className="header-content">
          <div className="project-info">
            <h1 className="project-title">{projectData.name}</h1>
            <p className="project-description">{projectData.description}</p>
          </div>
          <div className="project-status">
            <span className={`status-badge status-${projectData.status}`}>
              {projectData.status}
            </span>
          </div>
        </div>

        <div className="project-meta-grid">
          <div className="meta-card">
            <div className="meta-icon">🎯</div>
            <div className="meta-content">
              <label>Objective</label>
              <span>{projectData.objective || 'Not specified'}</span>
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">💰</div>
            <div className="meta-content">
              <label>Budget</label>
              <span>{projectData.budget ? `$${parseFloat(projectData.budget).toLocaleString()}` : 'Not set'}</span>
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">📅</div>
            <div className="meta-content">
              <label>Created</label>
              <span>{new Date(projectData.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-icon">🔄</div>
            <div className="meta-content">
              <label>Last Updated</label>
              <span>{new Date(projectData.updated_at || projectData.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {activeTab === tab.id && <div className="tab-indicator"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon datasets">📁</div>
                <div className="stat-content">
                  <h3>Datasets</h3>
                  <p className="stat-number">{datasets?.length || 0}</p>
                  <span className="stat-label">Uploaded files</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon models">🧠</div>
                <div className="stat-content">
                  <h3>AI Models</h3>
                  <p className="stat-number">{models?.length || 0}</p>
                  <span className="stat-label">Trained models</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon simulations">⚡</div>
                <div className="stat-content">
                  <h3>Simulations</h3>
                  <p className="stat-number">{simulations?.length || 0}</p>
                  <span className="stat-label">Completed runs</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <DatasetUpload 
                  projectId={id} 
                  onUpload={() => queryClient.invalidateQueries(['datasets', id])}
                  compact
                />
                {datasets && datasets.length > 0 && (
                  <AITraining 
                    projectId={id}
                    datasets={datasets}
                    onTrain={() => queryClient.invalidateQueries(['models', id])}
                    compact
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className="datasets-tab">
            <div className="tab-header">
              <h2>Datasets</h2>
              <DatasetUpload 
                projectId={id} 
                onUpload={() => queryClient.invalidateQueries(['datasets', id])}
              />
            </div>
            
            <div className="datasets-content">
              <h3>Uploaded Datasets</h3>
              {datasets?.length > 0 ? (
                <div className="datasets-grid">
                  {datasets.map(dataset => (
                    <div key={dataset.id} className="dataset-card">
                      <div className="dataset-header">
                        <h4 className="dataset-name">{dataset.name}</h4>
                        <span className="dataset-type">CSV</span>
                      </div>
                      <div className="dataset-info">
                        <div className="info-item">
                          <span className="info-label">File</span>
                          <span className="info-value">{dataset.file_name}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Rows</span>
                          <span className="info-value">{dataset.row_count?.toLocaleString()}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Size</span>
                          <span className="info-value">{(dataset.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Uploaded</span>
                          <span className="info-value">
                            {new Date(dataset.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="dataset-actions">
                        <button className="btn-secondary">
                          <span>Preview</span>
                        </button>
                        <button className="btn-danger">
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <h3>No datasets uploaded</h3>
                  <p>Upload your first dataset to start analyzing your marketing data.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ai-analysis' && (
          <div className="ai-analysis-tab">
            <div className="tab-header">
              <h2>AI Analysis</h2>
              <p>Advanced analytics and insights powered by AI</p>
            </div>
            <ProjectAnalysis projectId={id} />
          </div>
        )}

        {activeTab === 'ai-chat' && (
          <div className="ai-chat-tab">
            <div className="tab-header">
              <h2>AI Assistant</h2>
              <p>Chat with AI about your project and get insights</p>
            </div>
            <AIChat projectId={id} />
          </div>
        )}

        {activeTab === 'ai-predict' && (
          <div className="ai-predict-tab">
            <div className="tab-header">
              <h2>Campaign Predictions</h2>
              <p>Predict campaign performance and optimize your strategy</p>
            </div>
            <CampaignPredictor projectId={id} />
          </div>
        )}

        {activeTab === 'models' && (
          <div className="models-tab">
            <div className="tab-header">
              <h2>AI Models</h2>
              <AITraining 
                projectId={id}
                datasets={datasets || []}
                onTrain={() => queryClient.invalidateQueries(['models', id])}
              />
            </div>
            
            <div className="models-content">
              <h3>Trained Models</h3>
              {models?.length > 0 ? (
                <div className="models-grid">
                  {models.map(model => (
                    <div key={model.id} className="model-card">
                      <div className="model-header">
                        <h4 className="model-name">{model.model_name}</h4>
                        <span className={`model-status status-${model.status}`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="model-info">
                        <div className="info-item">
                          <span className="info-label">Type</span>
                          <span className="info-value">{model.model_type}</span>
                        </div>
                        {model.accuracy && (
                          <div className="info-item">
                            <span className="info-label">Accuracy</span>
                            <span className="info-value accuracy">
                              {(model.accuracy * 100).toFixed(2)}%
                            </span>
                          </div>
                        )}
                        <div className="info-item">
                          <span className="info-label">Created</span>
                          <span className="info-value">
                            {new Date(model.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {model.status === 'trained' && (
                        <div className="model-actions">
                          <button 
                            className="btn-primary"
                            onClick={() => handleSimulate(model.id)}
                            disabled={simulateMutation.isLoading}
                          >
                            {simulateMutation.isLoading ? (
                              <>
                                <div className="mini-spinner"></div>
                                Running...
                              </>
                            ) : (
                              'Run Simulation'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🧠</div>
                  <h3>No models trained</h3>
                  <p>Train your first AI model to start generating predictions.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'simulations' && (
          <div className="simulations-tab">
            <div className="tab-header">
              <h2>Marketing Simulations</h2>
              <p>Run and analyze marketing campaign simulations</p>
            </div>
            
            {simulations?.length > 0 ? (
              <div className="simulations-grid">
                {simulations.map(sim => (
                  <div key={sim.id} className="simulation-card">
                    <div className="simulation-header">
                      <h4 className="simulation-name">{sim.name}</h4>
                      <span className={`simulation-status status-${sim.status}`}>
                        {sim.status}
                      </span>
                    </div>
                    <div className="simulation-info">
                      <div className="info-item">
                        <span className="info-label">Model</span>
                        <span className="info-value">{sim.model_name}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Created</span>
                        <span className="info-value">
                          {new Date(sim.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {sim.results && (
                      <div className="simulation-results">
                        <h5>Performance Results</h5>
                        <div className="results-grid">
                          <div className="result-item">
                            <div className="result-value">{sim.results.roi}x</div>
                            <div className="result-label">ROI</div>
                          </div>
                          <div className="result-item">
                            <div className="result-value">{sim.results.conversions?.toLocaleString()}</div>
                            <div className="result-label">Conversions</div>
                          </div>
                          <div className="result-item">
                            <div className="result-value">${sim.results.revenue?.toLocaleString()}</div>
                            <div className="result-label">Revenue</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="simulation-actions">
                      <button className="btn-secondary">View Details</button>
                      <button className="btn-outline">Export</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚡</div>
                <h3>No simulations yet</h3>
                <p>Run your first simulation to see predicted campaign performance.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetail;