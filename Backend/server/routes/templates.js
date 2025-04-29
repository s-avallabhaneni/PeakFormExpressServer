const express = require('express');
const router = express.Router();
const templatesController = require('../controllers/templatesController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/users/:userId/templates', verifyToken, templatesController.createTemplate);
router.get('/users/:userId/templates', verifyToken, templatesController.getTemplatesByUser);
router.get('/templates/:templateId', verifyToken, templatesController.getTemplateById);
router.put('/templates/:templateId', verifyToken, templatesController.updateTemplate);
router.delete('/templates/:templateId', verifyToken, templatesController.deleteTemplate);
router.post('/templates/:templateId/archive', verifyToken, templatesController.archiveTemplate); // for history

module.exports = router;
