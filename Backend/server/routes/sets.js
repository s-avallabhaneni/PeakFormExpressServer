const express = require('express');
const router = express.Router();
const setsController = require('../controllers/setsController');

router.post('/exercises/:exerciseId/sets', setsController.createSet);
router.get('/exercises/:exerciseId/sets', setsController.getSetsForExercise);
router.delete('/sets/:setId', setsController.deleteSet);

module.exports = router;
