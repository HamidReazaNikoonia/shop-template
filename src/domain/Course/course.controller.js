const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../../utils/catchAsync');

const courseService = require('./course.service');

const getAllCourses = catchAsync(async (req, res) => {
  const courses = await courseService.getAllCourses({query: req.query});
  res.status(httpStatus.OK).send(courses);
});

const getCourseBySlugOrId = catchAsync(async (req, res) => {
  console.log('kir');

  const {slug} = req.params;

  if (!slug) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Course ID or Slug');

  const isObjectId = mongoose.Types.ObjectId.isValid(req.params?.slug) &&
                   new mongoose.Types.ObjectId(req.params?.slug).toString() === req.params?.slug;

  console.log({identifier: mongoose.Types.ObjectId.isValid(req.params?.slug)})
  const identifier = isObjectId
    ? { _id: slug }
    : { slug };

  const course = await courseService.getCourseBySlugOrId(identifier);
  res.status(httpStatus.OK).send(course);
});

const createCourse = catchAsync(async (req, res) => {
  const newCourse = await courseService.createCourse(req.body);
  res.status(httpStatus.CREATED).send(newCourse);
});

const applyForCourse = catchAsync(async (req, res) => {
  const { course_id } = req.params;
  const { user_id } = req.body;

  const updatedCourse = await courseService.applyForCourse({
    courseId: course_id,
    userId: user_id,
  });

  res.status(httpStatus.OK).send({
    message: 'User successfully applied to the course.',
    course: updatedCourse,
  });
});

const updateCourse = catchAsync(async (req, res) => {
  const courseId = req.params.course_id;
  const updatedData = req.body;

  const updatedCourse = await courseService.updateCourse(courseId, updatedData);
  res.status(httpStatus.OK).send(updatedCourse);
});

const deleteCourse = catchAsync(async (req, res) => {
  const courseId = req.params.course_id;

  await courseService.deleteCourse(courseId);
  res.status(httpStatus.NO_CONTENT).send();
});



// Course  Category


const getAllCourseCategories = catchAsync(async (req, res) => {
  const courseCategory = await courseService.getAllCourseCategories();
  res.status(httpStatus.OK).send(courseCategory);
});


const createCourseCategory = catchAsync(async (req, res) => {
  const newCourseCategory = await courseService.createCourseCategory(req.body);
  res.status(httpStatus.CREATED).send(newCourseCategory);
});


module.exports = {
  getAllCourses,
  getCourseBySlugOrId,
  createCourse,
  applyForCourse,
  getAllCourseCategories,
  createCourseCategory,
  updateCourse,
  deleteCourse
};
