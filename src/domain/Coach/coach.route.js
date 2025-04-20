const express = require('express');
const router = express.Router();
const coachController = require('./coach.controller');
const coachCourseProgramController = require('./courseProgress.controller');

// Get all coaches
router.route('/').get(coachController.getAllCoaches).post(coachController.createCoach);

router.post('/coach-course-program/:coachId/enroll', coachCourseProgramController.enrollInCourse);
router.post('/coach-course-program/:coachId/:coachCourseProgramId/:subjectId/complete', coachCourseProgramController.completeSubject);
router.get(
  '/coach-course-program/:coachId/:coachCourseProgramId/current-subject',
  coachCourseProgramController.getCurrentSubject
);

// Get specific coach by ID
router.get('/:couch_id', coachController.getCoachById);

module.exports = router;
