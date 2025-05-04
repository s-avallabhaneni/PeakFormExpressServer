const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/workoutFeedbackController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/users/:userId/feedback', verifyToken, feedbackController.createFeedback);
router.get('/users/:userId/feedback', verifyToken, feedbackController.getFeedbacksByUser);
router.delete('/feedback/:id', verifyToken, feedbackController.deleteFeedback);

module.exports = router;
