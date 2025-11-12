const tf = require('@tensorflow/tfjs-node');
const DataPreprocessor = require('../DataPreprocessor');

class CTRPredictor {
  constructor() {
    this.model = null;
    this.isTrained = false;
    this.featureNames = [];
    this.normalizationStats = {};
  }

  async createModel(inputShape) {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 64,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dense({
          units: 1,
          activation: 'sigmoid' // CTR entre 0 e 1
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse', 'mae']
    });

    return this.model;
  }

  async train(data, config) {
    try {
      // Pré-processar dados
      const processed = DataPreprocessor.preprocessForTraining(data, {
        ...config,
        predictionTarget: 'ctr'
      });

      if (processed.features.length === 0) {
        throw new Error('Dados insuficientes para treinamento');
      }

      this.featureNames = processed.featureNames;

      // Normalizar dados
      const { normalized, stats } = DataPreprocessor.normalizeData(processed.features);
      this.normalizationStats = stats;

      // Converter para tensores
      const featuresTensor = tf.tensor2d(normalized);
      const labelsTensor = tf.tensor1d(processed.labels);

      // Criar modelo
      await this.createModel(processed.featureCount);

      // Treinar
      const history = await this.model.fit(featuresTensor, labelsTensor, {
        epochs: config.epochs || 100,
        batchSize: config.batchSize || 32,
        validationSplit: 0.2,
        verbose: config.verbose || 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (config.onProgress) {
              config.onProgress({
                epoch: epoch + 1,
                loss: logs.loss,
                accuracy: logs.acc
              });
            }
          }
        }
      });

      this.isTrained = true;

      // Limpar tensores
      featuresTensor.dispose();
      labelsTensor.dispose();

      return {
        history: history.history,
        featureNames: this.featureNames,
        trainingSamples: processed.features.length
      };
    } catch (error) {
      console.error('Training error:', error);
      throw error;
    }
  }

  async predict(inputData) {
    if (!this.isTrained) {
      throw new Error('Model not trained');
    }

    const featureVector = DataPreprocessor.prepareForPrediction(
      inputData, 
      this.featureNames, 
      this.normalizationStats
    );

    const inputTensor = tf.tensor2d([featureVector]);
    const prediction = this.model.predict(inputTensor);
    const result = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    return result[0]; // Retorna o CTR previsto
  }

  async evaluate(testData) {
    const processed = DataPreprocessor.preprocessForTraining(testData, {
      predictionTarget: 'ctr'
    });

    const { normalized } = DataPreprocessor.normalizeData(processed.features);
    const featuresTensor = tf.tensor2d(normalized);
    const labelsTensor = tf.tensor1d(processed.labels);

    const evaluation = this.model.evaluate(featuresTensor, labelsTensor);
    const loss = evaluation[0].dataSync()[0];

    featuresTensor.dispose();
    labelsTensor.dispose();

    return { loss };
  }
}

module.exports = CTRPredictor;