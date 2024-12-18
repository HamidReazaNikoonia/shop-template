const express = require('express');
const courseController = require('./course.controller');

const router = express.Router();

router.route('/')
  .get(courseController.getAllCourses)
  .post(courseController.createCourse);



router.post('/apply/:course_id', courseController.applyForCourse); // NEW ROUTE


router.route('/category')
  .get(courseController.getAllCourseCategories)
  .post(courseController.createCourseCategory)

router.get('/:slug', courseController.getCourseBySlugOrId);

// Update a course
router.put('/:course_id', courseController.updateCourse);

// Delete a course
router.delete('/:course_id', courseController.deleteCourse);

module.exports = router;
