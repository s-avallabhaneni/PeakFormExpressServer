const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/users/:userId/history', verifyToken, historyController.getTemplateHistoryForUser);
router.get('/history/:historyId', verifyToken, historyController.getArchivedTemplateDetails);

module.exports = router;
