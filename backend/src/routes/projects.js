const express = require('express');
const ProjectController = require('../controllers/projects');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', ProjectController.createProject);
router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProject);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

module.exports = router;