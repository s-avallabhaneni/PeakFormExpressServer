const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/users/:userId/prompts', verifyToken, promptController.createPrompt);

router.get('/users/:userId/prompts', verifyToken, promptController.getPromptsByUser);

module.exports = router;
