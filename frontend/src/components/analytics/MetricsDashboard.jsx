import React from 'react';
import { useQuery } from 'react-query';
import { projectService } from '../../services/api';

function MetricsDashboard({ projectId }) {
  const { data: analytics, isLoading } = useQuery(
    ['analytics', projectId],
    () => projectService.getAnalytics(projectId).then(res => res.data),
    { enabled: !!projectId }
  );

  if (isLoading) return <div className="loading">Carregando analytics...</div>;
  if (!analytics) return <div>Nenhum dado analítico disponível</div>;

  const { basic, advanced, trends } = analytics;

  return (
    <div className="metrics-dashboard">
      <div className="kpi-grid">
        <div className="kpi-card primary">
          <h3>CTR</h3>
          <div className="kpi-value">{basic.ctr}%</div>
          <div className="kpi-trend">
            {trends.ctrTrend > 0 ? '↗' : '↘'} {Math.abs(trends.ctrTrend).toFixed(1)}%
          </div>
        </div>
        
        <div className="kpi-card success">
          <h3>Conversões</h3>
          <div className="kpi-value">{basic.conversions.toLocaleString()}</div>
          <div className="kpi-trend">
            {trends.conversionTrend > 0 ? '↗' : '↘'} {Math.abs(trends.conversionTrend).toFixed(1)}%
          </div>
        </div>
        
        <div className="kpi-card warning">
          <h3>Custo Total</h3>
          <div className="kpi-value">${basic.cost.toLocaleString()}</div>
          <div className="kpi-trend">
            {trends.costTrend > 0 ? '↗' : '↘'} {Math.abs(trends.costTrend).toFixed(1)}%
          </div>
        </div>
        
        <div className="kpi-card info">
          <h3>ROI</h3>
          <div className="kpi-value">{basic.roi}%</div>
          <div className="kpi-subtext">Return on Investment</div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <h4>Performance por Canal</h4>
          <div className="channel-performance">
            {advanced.channelPerformance?.slice(0, 5).map(channel => (
              <div key={channel.dimension} className="channel-item">
                <div className="channel-name">{channel.dimension}</div>
                <div className="channel-metrics">
                  <span>CTR: {channel.ctr}%</span>
                  <span>ROI: {channel.roi}%</span>
                  <span>Custo: ${channel.cost.toLocaleString()}</span>
                </div>
                <div className="efficiency-bar">
                  <div 
                    className="efficiency-fill"
                    style={{ width: `${Math.min(channel.efficiency * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <h4>Eficiência de Budget</h4>
          <div className="budget-metrics">
            <div className="budget-item">
              <label>Budget Utilizado:</label>
              <span>{advanced.budgetEfficiency.budgetUtilization.toFixed(1)}%</span>
            </div>
            <div className="budget-item">
              <label>Receita por Dólar:</label>
              <span>${advanced.budgetEfficiency.revenuePerDollar.toFixed(2)}</span>
            </div>
            <div className="budget-item">
              <label>Budget Restante:</label>
              <span>${advanced.budgetEfficiency.remainingBudget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {analytics.recommendations && (
        <div className="recommendations-section">
          <h4>Recomendações de Otimização</h4>
          <div className="recommendations-list">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation ${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-type">{rec.type}</span>
                  <span className={`rec-priority ${rec.priority}`}>
                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <p className="rec-message">{rec.message}</p>
                <div className="rec-actions">
                  <strong>Ações sugeridas:</strong>
                  <ul>
                    {rec.actions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MetricsDashboard;