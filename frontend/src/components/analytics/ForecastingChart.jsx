import React, { useMemo } from 'react';

function ForecastingChart({ historicalData, predictions }) {
  const chartData = useMemo(() => {
    if (!historicalData || !predictions) return null;

    const historical = historicalData.map(item => ({
      date: item.date,
      actual: item.ctr || item.conversions || item.cost,
      type: 'historical'
    }));

    const forecast = predictions.map(pred => ({
      date: pred.date,
      predicted: pred.value,
      confidence: pred.confidence,
      type: 'forecast'
    }));

    return [...historical, ...forecast];
  }, [historicalData, predictions]);

  if (!chartData) return <div>Carregando dados de previsão...</div>;

  return (
    <div className="forecasting-chart">
      <h4>Previsão de Performance</h4>
      <div className="chart-container">
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color historical"></div>
            <span>Dados Históricos</span>
          </div>
          <div className="legend-item">
            <div className="legend-color forecast"></div>
            <span>Previsão</span>
          </div>
        </div>
        
        <div className="chart-bars">
          {chartData.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div className="bar-label">{item.date}</div>
              <div className="chart-bar-wrapper">
                {item.actual && (
                  <div 
                    className="chart-bar historical"
                    style={{ height: `${(item.actual / 100) * 200}px` }}
                    title={`Atual: ${item.actual}`}
                  >
                    <div className="bar-value">{item.actual.toFixed(1)}</div>
                  </div>
                )}
                {item.predicted && (
                  <div 
                    className="chart-bar forecast"
                    style={{ 
                      height: `${(item.predicted / 100) * 200}px`,
                      opacity: item.confidence || 0.7
                    }}
                    title={`Previsto: ${item.predicted.toFixed(1)} (Confiança: ${((item.confidence || 0) * 100).toFixed(0)}%)`}
                  >
                    <div className="bar-value">{item.predicted.toFixed(1)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ForecastingChart;