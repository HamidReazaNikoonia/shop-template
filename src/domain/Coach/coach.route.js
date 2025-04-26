const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

const coachValidation = require('./coach.validation');

const router = express.Router();
const coachController = require('./coach.controller');
const coachCourseProgramController = require('./courseProgress.controller');

// Get all coaches
router.route('/').get(coachController.getAllCoaches).post(coachController.createCoach);

router.patch(
  '/complete_account/:coachId',
  validate(coachValidation.completeCoachInfo),
  auth(),
  coachController.completeCouchInfo
);

router.post('/coach-course-program/:coachId/enroll', coachCourseProgramController.enrollInCourse);
router.post(
  '/coach-course-program/:coachId/:coachCourseProgramId/:subjectId/complete',
  coachCourseProgramController.completeSubject
);
router.get(
  '/coach-course-program/:coachId/:coachCourseProgramId/current-subject',
  coachCourseProgramController.getCurrentSubject
);

// Get specific coach by ID
router.get('/admin/:coachId', coachController.getCoachByIdForAdmin);

module.exports = router;
