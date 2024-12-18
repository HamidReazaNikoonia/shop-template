const express = require('express');
const router = express.Router();
const coachController = require('./coach.controller');

// Get all coaches
router.route('/')
    .get(coachController.getAllCoaches)
    .post(coachController.createCoach);

// Get specific coach by ID
router.get('/:couch_id', coachController.getCoachById);

module.exports = router;
