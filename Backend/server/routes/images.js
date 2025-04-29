const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post(
  '/users/:userId/images',
  verifyToken,
  imageController.uploadMiddleware,
  imageController.handleImageUpload
);

router.get('/users/:userId/images', verifyToken, imageController.getUserImages);

module.exports = router;
