import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { aiService } from '../../services/api';
import '../../styles/ProjectAnalysis.css';

function ProjectAnalysis({ projectId }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: analysis, refetch, isLoading, error } = useQuery(
    ['project-analysis', projectId],
    () => aiService.analyzeProject(projectId).then(res => res.data),
    {
      enabled: false,
      refetchOnWindowFocus: false,
      retry: 2
    }
  );

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await refetch();
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || isAnalyzing) {
    return (
      <div className="analysis-container">
        <div className="analysis-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">
              <h3>AI Analysis in Progress</h3>
              <p>Processing your project data and generating insights...</p>
              <div className="loading-steps">
                <div className="step active">
                  <span className="step-icon">📊</span>
                  <span>Analyzing datasets</span>
                </div>
                <div className="step">
                  <span className="step-icon">🤖</span>
                  <span>Running AI models</span>
                </div>
                <div className="step">
                  <span className="step-icon">💡</span>
                  <span>Generating insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analysis-container">
        <div className="analysis-error">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className="error-content">
            <h3>Analysis Failed</h3>
            <p>{error.response?.data?.error || 'Unable to analyze project data. Please try again.'}</p>
            <div className="error-actions">
              <button onClick={handleAnalyze} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-container">
      {!analysis && (
        <div className="analysis-prompt">
          <div className="prompt-content">
            <div className="prompt-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"/>
                <polyline points="7.5 19.79 7.5 14.6 3 12"/>
                <polyline points="21 12 16.5 14.6 16.5 19.79"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div className="prompt-text">
              <h2>AI-Powered Project Analysis</h2>
              <p>Get intelligent insights and data-driven recommendations for your marketing project</p>
            </div>
            <div className="capabilities">
              <div className="capability">
                <span className="capability-icon">📈</span>
                <div className="capability-text">
                  <strong>Performance Analysis</strong>
                  <span>Comprehensive performance evaluation</span>
                </div>
              </div>
              <div className="capability">
                <span className="capability-icon">💡</span>
                <div className="capability-text">
                  <strong>Strategic Insights</strong>
                  <span>Actionable business insights</span>
                </div>
              </div>
              <div className="capability">
                <span className="capability-icon">🎯</span>
                <div className="capability-text">
                  <strong>Smart Recommendations</strong>
                  <span>Prioritized optimization actions</span>
                </div>
              </div>
              <div className="capability">
                <span className="capability-icon">🔮</span>
                <div className="capability-text">
                  <strong>Future Predictions</strong>
                  <span>Data-driven performance forecasts</span>
                </div>
              </div>
            </div>
            <button onClick={handleAnalyze} className="btn-primary large">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              Start AI Analysis
            </button>
          </div>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <div className="results-header">
            <div className="header-content">
              <h2>Project Analysis Report</h2>
              <p>AI-powered insights generated from your project data</p>
            </div>
            <button onClick={handleAnalyze} className="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M23 4v6h-6M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Reanalyze
            </button>
          </div>

          {/* Performance Analysis */}
          {analysis.analysis?.performance_analysis && (
            <div className="analysis-section">
              <div className="section-header">
                <div className="section-icon">📈</div>
                <h3>Performance Analysis</h3>
              </div>
              <div className="performance-grid">
                <div className="score-card">
                  <div className="score-content">
                    <div className="score-value">
                      {analysis.analysis.performance_analysis.overall_score}/100
                    </div>
                    <div className="score-label">Overall Score</div>
                    <div className="score-description">
                      Based on comprehensive data analysis
                    </div>
                  </div>
                  <div className="score-visual">
                    <div 
                      className="score-circle"
                      style={{ 
                        background: `conic-gradient(#4f46e5 ${analysis.analysis.performance_analysis.overall_score * 3.6}deg, #e5e7eb 0deg)` 
                      }}
                    >
                      <span>{analysis.analysis.performance_analysis.overall_score}</span>
                    </div>
                  </div>
                </div>
                
                <div className="analysis-details">
                  <div className="strengths-section">
                    <h4>Strengths</h4>
                    <div className="items-list">
                      {analysis.analysis.performance_analysis.strengths.map((strength, index) => (
                        <div key={index} className="list-item positive">
                          <span className="item-icon">✅</span>
                          <span className="item-text">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="weaknesses-section">
                    <h4>Improvement Areas</h4>
                    <div className="items-list">
                      {analysis.analysis.performance_analysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="list-item negative">
                          <span className="item-icon">⚠️</span>
                          <span className="item-text">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategic Insights */}
          {analysis.analysis?.strategic_insights && (
            <div className="analysis-section">
              <div className="section-header">
                <div className="section-icon">💡</div>
                <h3>Strategic Insights</h3>
              </div>
              <div className="insights-grid">
                {analysis.analysis.strategic_insights.map((insight, index) => (
                  <div key={index} className="insight-card">
                    <div className="insight-number">{index + 1}</div>
                    <div className="insight-content">
                      <p>{insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.analysis?.recommendations && (
            <div className="analysis-section">
              <div className="section-header">
                <div className="section-icon">🎯</div>
                <h3>Action Recommendations</h3>
              </div>
              <div className="recommendations-grid">
                {analysis.analysis.recommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="rec-header">
                      <h4>{rec.action}</h4>
                      <div className="rec-priority">
                        <span className={`priority-dot ${getPriorityClass(rec.impact, rec.effort)}`}></span>
                        {getPriorityLabel(rec.impact, rec.effort)}
                      </div>
                    </div>
                    <div className="rec-meta">
                      <span className={`impact-tag impact-${rec.impact?.toLowerCase()}`}>
                        Impact: {rec.impact}
                      </span>
                      <span className={`effort-tag effort-${rec.effort?.toLowerCase()}`}>
                        Effort: {rec.effort}
                      </span>
                    </div>
                    {rec.expected_improvement && (
                      <div className="improvement">
                        <strong>Expected Improvement:</strong> {rec.expected_improvement}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Predictions */}
          {analysis.analysis?.predictions && (
            <div className="analysis-section">
              <div className="section-header">
                <div className="section-icon">🔮</div>
                <h3>Performance Predictions</h3>
              </div>
              <div className="predictions-card">
                <div className="prediction-content">
                  <div className="prediction-text">
                    <h4>Next 30 Days Forecast</h4>
                    <p>{analysis.analysis.predictions.next_30_days}</p>
                  </div>
                  <div className="confidence-level">
                    <span className="confidence-label">Confidence</span>
                    <span className={`confidence-value confidence-${analysis.analysis.predictions.confidence?.toLowerCase()}`}>
                      {analysis.analysis.predictions.confidence}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {analysis.analysis?.alerts && analysis.analysis.alerts.length > 0 && (
            <div className="analysis-section">
              <div className="section-header">
                <div className="section-icon">🚨</div>
                <h3>Important Alerts</h3>
              </div>
              <div className="alerts-grid">
                {analysis.analysis.alerts.map((alert, index) => (
                  <div key={index} className={`alert-card alert-${alert.level}`}>
                    <div className="alert-icon">
                      {alert.level === 'high' ? '🔴' : alert.level === 'medium' ? '🟡' : '🔵'}
                    </div>
                    <div className="alert-content">
                      <h4>{alert.message}</h4>
                      <p>{alert.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getPriorityClass(impact, effort) {
  if (impact === 'high' && effort === 'low') return 'high';
  if (impact === 'high' && effort === 'medium') return 'medium';
  return 'low';
}

function getPriorityLabel(impact, effort) {
  if (impact === 'high' && effort === 'low') return 'High Priority';
  if (impact === 'high' && effort === 'medium') return 'Medium Priority';
  return 'Low Priority';
}

export default ProjectAnalysis;