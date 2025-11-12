const CTRPredictor = require('./models/CTRPredictor');
const ROIPredictor = require('./models/ROIPredictor');
const CustomerLTV = require('./models/CustomerLTV');

class MarketingPredictor {
  constructor() {
    this.models = {
      ctr: new CTRPredictor(),
      roi: new ROIPredictor(),
      ltv: new CustomerLTV()
    };
    this.availableModels = {
      ctr: 'Click-Through Rate Prediction',
      roi: 'Return on Investment Prediction', 
      ltv: 'Customer Lifetime Value',
      conversion: 'Conversion Rate Prediction',
      engagement: 'User Engagement Prediction'
    };
  }

  async trainModel(modelType, data, config = {}) {
    if (!this.models[modelType]) {
      throw new Error(`Model type ${modelType} not supported`);
    }

    const trainingConfig = {
      epochs: config.epochs || 50,
      batchSize: config.batchSize || 32,
      validationSplit: 0.2,
      onProgress: config.onProgress,
      ...config
    };

    const result = await this.models[modelType].train(data, trainingConfig);
    
    return {
      modelType,
      ...result,
      timestamp: new Date().toISOString()
    };
  }

  async predict(modelType, inputData) {
    if (!this.models[modelType] || !this.models[modelType].isTrained) {
      throw new Error(`Model ${modelType} not available or not trained`);
    }

    const prediction = await this.models[modelType].predict(inputData);
    
    return {
      modelType,
      prediction,
      confidence: this.calculateConfidence(prediction, modelType),
      timestamp: new Date().toISOString()
    };
  }

  calculateConfidence(prediction, modelType) {
    // Lógica simples de confiança baseada na distância dos extremos
    if (modelType === 'ctr') {
      // CTR: mais confiável quando não está muito próximo de 0 ou 1
      const distanceFromExtreme = Math.min(prediction, 1 - prediction);
      return Math.min(distanceFromExtreme * 4, 1); // Scale to 0-1
    }
    
    return 0.7; // Confiança padrão
  }

  getModelInfo(modelType) {
    return {
      type: modelType,
      name: this.availableModels[modelType],
      isTrained: this.models[modelType]?.isTrained || false,
      features: this.models[modelType]?.featureNames || []
    };
  }

  async getFeatureImportance(modelType) {
    // Implementação simplificada de importância de features
    // Em produção, usar técnicas como SHAP ou permutation importance
    if (!this.models[modelType] || !this.models[modelType].isTrained) {
      return [];
    }

    const features = this.models[modelType].featureNames;
    return features.map(feature => ({
      feature,
      importance: Math.random() // Placeholder - implementar cálculo real
    })).sort((a, b) => b.importance - a.importance);
  }
}

module.exports = MarketingPredictor;