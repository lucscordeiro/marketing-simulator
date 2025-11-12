import React, { useState } from 'react';
import { aiService } from '../../services/api';
import '../../styles/CampaignPredictor.css';

function CampaignPredictor({ projectId }) {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignData, setCampaignData] = useState({
    budget: 1000,
    impressions: 10000,
    channel: 'search',
    targetAudience: 'general',
    creativeType: 'standard',
    duration: 7
  });

  const channels = [
    { value: 'search', label: 'Google Ads', icon: '🔍', color: '#4285F4' },
    { value: 'social', label: 'Facebook/Instagram', icon: '📱', color: '#1877F2' },
    { value: 'display', label: 'Display Network', icon: '🖼️', color: '#FF6D01' },
    { value: 'video', label: 'YouTube', icon: '🎥', color: '#FF0000' },
    { value: 'email', label: 'Email Marketing', icon: '📧', color: '#EA4335' }
  ];

  const audiences = [
    { value: 'general', label: 'Público Geral', description: 'Alcance amplo' },
    { value: 'young', label: 'Jovens (18-24)', description: 'Mobile-first' },
    { value: 'adults', label: 'Adultos (25-44)', description: 'Profissionais' },
    { value: 'seniors', label: 'Maduros (45+)', description: 'Renda estabelecida' },
    { value: 'business', label: 'Profissionais', description: 'B2B' }
  ];

  const creativeTypes = [
    { value: 'standard', label: 'Padrão', description: 'Criativos básicos' },
    { value: 'premium', label: 'Premium', description: 'Criativos otimizados' },
    { value: 'video', label: 'Vídeo', description: 'Conteúdo em vídeo' },
    { value: 'interactive', label: 'Interativo', description: 'Engajamento alto' }
  ];

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      console.log('📤 Sending campaign data:', campaignData);
      
      const response = await aiService.predictCampaign(projectId, {
        campaignData: campaignData
      });
      
      console.log('✅ Prediction received:', response.data);
      setPrediction(response.data);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error generating prediction: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0.00%';
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '$0.00';
    return `$${parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('en-US');
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const resetForm = () => {
    setPrediction(null);
    setCampaignData({
      budget: 1000,
      impressions: 10000,
      channel: 'search',
      targetAudience: 'general',
      creativeType: 'standard',
      duration: 7
    });
  };

  const selectedChannel = channels.find(c => c.value === campaignData.channel);
  const selectedAudience = audiences.find(a => a.value === campaignData.targetAudience);
  const selectedCreative = creativeTypes.find(c => c.value === campaignData.creativeType);

  return (
    <div className="campaign-predictor">
      <div className="predictor-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9a9 9 0 0 0-9 9"/>
            </svg>
          </div>
          <div className="header-text">
            <h2>Campaign Predictor</h2>
            <p>Simulate and predict the performance of your marketing campaigns using AI</p>
          </div>
        </div>
        {prediction && (
          <button className="btn-secondary" onClick={resetForm}>
            New Prediction
          </button>
        )}
      </div>

      <div className="predictor-content">
        <div className="campaign-configuration">
          <div className="config-card">
            <div className="card-header">
              <h3>Campaign Setup</h3>
              <p>Configure your campaign parameters</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Budget</label>
                <div className="input-with-suffix">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    value={campaignData.budget}
                    onChange={(e) => handleInputChange('budget', parseInt(e.target.value) || 1000)}
                    min="100"
                    step="100"
                    className="form-input"
                  />
                </div>
                <div className="input-hint">Minimum: $100</div>
              </div>

              <div className="form-group">
                <label className="form-label">Impressions</label>
                <input
                  type="number"
                  value={campaignData.impressions}
                  onChange={(e) => handleInputChange('impressions', parseInt(e.target.value) || 10000)}
                  min="1000"
                  step="1000"
                  className="form-input"
                />
                <div className="input-hint">Expected reach</div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration (days)</label>
                <input
                  type="number"
                  value={campaignData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 7)}
                  min="1"
                  max="30"
                  className="form-input"
                />
                <div className="input-hint">Campaign length</div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Marketing Channel</label>
                <div className="channel-selector">
                  {channels.map(channel => (
                    <label key={channel.value} className="channel-option">
                      <input
                        type="radio"
                        name="channel"
                        value={channel.value}
                        checked={campaignData.channel === channel.value}
                        onChange={(e) => handleInputChange('channel', e.target.value)}
                      />
                      <div className="option-content" style={{ borderColor: campaignData.channel === channel.value ? channel.color : '#e5e7eb' }}>
                        <span className="option-icon">{channel.icon}</span>
                        <span className="option-label">{channel.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Target Audience</label>
                <select
                  value={campaignData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="form-input"
                >
                  {audiences.map(audience => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
                <div className="selected-audience">
                  {selectedAudience?.description}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Creative Type</label>
                <select
                  value={campaignData.creativeType}
                  onChange={(e) => handleInputChange('creativeType', e.target.value)}
                  className="form-input"
                >
                  {creativeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <div className="selected-creative">
                  {selectedCreative?.description}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                onClick={handlePredict} 
                disabled={isLoading}
                className={`btn-primary ${isLoading ? 'loading' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="button-spinner"></div>
                    Generating Prediction...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9v-9m0-9a9 9 0 0 0-9 9"/>
                    </svg>
                    Generate Prediction
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {prediction && (
          <div className="prediction-results">
            <div className="results-card">
              <div className="card-header">
                <h3>Prediction Results</h3>
                <div className="confidence-badge" style={{ backgroundColor: getConfidenceColor(prediction.prediction?.confidence) }}>
                  {prediction.prediction?.confidence || 'Medium'} Confidence
                </div>
              </div>

              <div className="prediction-metrics">
                <div className="metric-grid">
                  <div className="metric-card primary">
                    <div className="metric-icon">🎯</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {formatPercentage(prediction.prediction?.predictions?.ctr)}
                      </div>
                      <div className="metric-label">Click-Through Rate</div>
                      <div className="metric-description">Expected CTR based on historical data</div>
                    </div>
                  </div>

                  <div className="metric-card success">
                    <div className="metric-icon">📈</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {formatPercentage(prediction.prediction?.predictions?.conversion_rate)}
                      </div>
                      <div className="metric-label">Conversion Rate</div>
                      <div className="metric-description">Estimated conversion probability</div>
                    </div>
                  </div>

                  <div className="metric-card warning">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {prediction.prediction?.predictions?.roi?.toFixed(0)}%
                      </div>
                      <div className="metric-label">ROI Estimate</div>
                      <div className="metric-description">Return on investment projection</div>
                    </div>
                  </div>

                  <div className="metric-card info">
                    <div className="metric-icon">⚡</div>
                    <div className="metric-content">
                      <div className="metric-value">
                        {formatCurrency(prediction.prediction?.predictions?.cpa)}
                      </div>
                      <div className="metric-label">Cost Per Acquisition</div>
                      <div className="metric-description">Estimated acquisition cost</div>
                    </div>
                  </div>
                </div>
              </div>

              {prediction.prediction?.predictions?.estimated_conversions && (
                <div className="conversion-summary">
                  <h4>Conversion Summary</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Estimated Clicks</span>
                      <span className="summary-value">
                        {formatNumber(prediction.prediction.predictions.estimated_conversions * 100)}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Estimated Conversions</span>
                      <span className="summary-value">
                        {formatNumber(prediction.prediction.predictions.estimated_conversions)}
                      </span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Estimated Revenue</span>
                      <span className="summary-value">
                        {formatCurrency(prediction.prediction.predictions.estimated_revenue)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {prediction.prediction?.recommendations && prediction.prediction.recommendations.length > 0 && (
                <div className="recommendations-section">
                  <h4>Optimization Recommendations</h4>
                  <div className="recommendations-list">
                    {prediction.prediction.recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <div className="recommendation-icon">💡</div>
                        <div className="recommendation-content">
                          <p>{typeof rec === 'string' ? rec : rec.action || rec}</p>
                          {rec.impact && (
                            <span className="impact-tag">{rec.impact}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="prediction-footer">
                <div className="data-source">
                  <strong>Data Source:</strong> Based on {prediction.historical_samples || 0} historical campaigns
                </div>
                {prediction.prediction?.note && (
                  <div className="prediction-note">
                    <strong>Note:</strong> {prediction.prediction.note}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CampaignPredictor;