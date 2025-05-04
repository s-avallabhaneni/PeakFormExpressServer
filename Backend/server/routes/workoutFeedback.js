const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/workoutFeedbackController');

router.post('/feedback', feedbackController.createFeedback);
router.delete('/feedback/:id', feedbackController.deleteFeedback);

module.exports = router;
