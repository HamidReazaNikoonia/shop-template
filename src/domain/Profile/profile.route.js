const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');

// Get a user's profile
router.get('/:user_id', profileController.getProfile);

// Update liked products or courses
router.put('/:user_id', profileController.updateProfile);

module.exports = router;
