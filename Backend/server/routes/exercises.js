const express = require('express');
const router = express.Router();
const exercisesController = require('../controllers/exercisesController');

router.post('/templates/:templateId/exercises', exercisesController.createExercise);
router.get('/templates/:templateId/exercises', exercisesController.getExercisesForTemplate);
router.put('/exercises/:exerciseId', exercisesController.updateExercise);
router.delete('/exercises/:exerciseId', exercisesController.deleteExercise);

module.exports = router;
