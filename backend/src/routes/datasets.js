const express = require('express');
const DatasetController = require('../controllers/datasets');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/upload/:projectId', DatasetController.uploadDataset);
router.get('/project/:projectId', DatasetController.getProjectDatasets);
router.delete('/:id', DatasetController.deleteDataset);

// Rota de teste
router.get('/test', DatasetController.testUpload);

module.exports = router;