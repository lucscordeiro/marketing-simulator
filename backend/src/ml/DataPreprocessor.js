class DataPreprocessor {
  static preprocessForTraining(data, config) {
    const features = [];
    const labels = [];
    const featureNames = [];
    
    // Identificar features baseado no schema
    for (const [column, colConfig] of Object.entries(config.fieldConfig)) {
      if (colConfig.role === 'feature' && 
          (colConfig.type === 'numeric' || colConfig.type === 'currency' || colConfig.type === 'percentage')) {
        featureNames.push(column);
      }
    }
    
    // Processar cada linha
    for (const row of data) {
      const featureVector = [];
      let label = null;
      
      for (const featureName of featureNames) {
        const value = parseFloat(row[featureName]);
        featureVector.push(isNaN(value) ? 0 : value);
      }
      
      // Definir label baseado no objetivo
      if (config.predictionTarget === 'ctr' && row.clicks && row.impressions) {
        label = parseFloat(row.clicks) / parseFloat(row.impressions);
      } else if (config.predictionTarget === 'roi' && row.media_cost_usd && row.conversions) {
        // Simulação - ajuste conforme seus dados
        label = (parseFloat(row.conversions) * 100) / (parseFloat(row.media_cost_usd) || 1);
      } else if (config.predictionTarget === 'conversions' && row.conversions) {
        label = parseFloat(row.conversions);
      }
      
      if (label !== null && !isNaN(label)) {
        features.push(featureVector);
        labels.push(label);
      }
    }
    
    return {
      features,
      labels,
      featureNames,
      featureCount: featureNames.length
    };
  }
  
  static normalizeData(features) {
    if (features.length === 0) return { normalized: [], stats: {} };
    
    const stats = {};
    const numFeatures = features[0].length;
    const normalized = [];
    
    // Calcular estatísticas para cada feature
    for (let i = 0; i < numFeatures; i++) {
      const values = features.map(f => f[i]);
      stats[i] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        std: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - values.reduce((a, b) => a + b, 0) / values.length, 2), 0) / values.length)
      };
    }
    
    // Normalizar features
    for (const featureVector of features) {
      const normalizedVector = [];
      for (let i = 0; i < numFeatures; i++) {
        const value = featureVector[i];
        const stat = stats[i];
        // Normalização min-max
        const normalized = (value - stat.min) / (stat.max - stat.min || 1);
        normalizedVector.push(normalized);
      }
      normalized.push(normalizedVector);
    }
    
    return { normalized, stats };
  }
  
  static prepareForPrediction(inputData, featureNames, stats) {
    const featureVector = [];
    
    for (const featureName of featureNames) {
      const value = parseFloat(inputData[featureName] || 0);
      const featureIndex = featureNames.indexOf(featureName);
      
      if (featureIndex !== -1 && stats[featureIndex]) {
        const stat = stats[featureIndex];
        const normalized = (value - stat.min) / (stat.max - stat.min || 1);
        featureVector.push(normalized);
      } else {
        featureVector.push(0);
      }
    }
    
    return featureVector;
  }
}

module.exports = DataPreprocessor;