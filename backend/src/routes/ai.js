const express = require('express');
const AIController = require('../controllers/ai');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Análise e Insights
router.get('/analyze/project/:projectId', AIController.analyzeProject);
router.post('/insights/generate/:projectId', AIController.generateInsights);

// Previsões
router.post('/predict/campaign/:projectId', AIController.predictCampaign);
router.post('/optimize/campaign/:campaignId', AIController.optimizeCampaign);

// Agente Conversacional
router.post('/chat/:projectId', AIController.chatWithAgent);

// Modelos existentes (manter compatibilidade)
router.post('/train', AIController.trainModel);
router.get('/models/:projectId', AIController.getProjectModels);
router.post('/simulate', AIController.simulate);
router.get('/simulations/:projectId', AIController.getSimulations);

module.exports = router;