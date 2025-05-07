const express = require('express');
const router = express.Router();
const workoutDataController = require('../controllers/workoutDataController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/users/:userId/workoutData', verifyToken, workoutDataController.getWorkoutData);

module.exports = router;