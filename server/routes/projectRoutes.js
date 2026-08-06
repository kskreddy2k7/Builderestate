const express = require('express');
const router = express.Router();
const { getAllProjects, createProject, getBuilderProjects } = require('../controllers/projectController');
const { authMiddleware, checkRole } = require('../middleware/auth');

router.get('/', getAllProjects);
router.get('/builder', authMiddleware, checkRole(['BUILDER']), getBuilderProjects);
router.post('/', authMiddleware, checkRole(['BUILDER']), createProject);

module.exports = router;
