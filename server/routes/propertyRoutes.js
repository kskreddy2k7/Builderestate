const express = require('express');
const router = express.Router();
const { getAllProperties, getPropertyById, createProperty, updateProperty, deleteProperty } = require('../controllers/propertyController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Protected routes (Builder & Admin)
router.post('/', authMiddleware, checkRole(['BUILDER', 'ADMIN']), upload.array('images', 5), createProperty);
router.put('/:id', authMiddleware, checkRole(['BUILDER', 'ADMIN']), upload.array('images', 5), updateProperty);
router.delete('/:id', authMiddleware, checkRole(['BUILDER', 'ADMIN']), deleteProperty);

module.exports = router;
