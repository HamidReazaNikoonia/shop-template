const httpStatus = require('http-status');
const mongoose = require('mongoose');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');

const courseService = require('./course.service');
const { Course }  = require('./course.model');
const Upload = require('../../services/uploader/uploader.model');

const getAllCourses = catchAsync(async (req, res) => {
  const courses = await courseService.getAllCourses({query: req.query});
  res.status(httpStatus.OK).send(courses);
});

const getCourseBySlugOrId = catchAsync(async (req, res) => {

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



// Get Private Course files

// Access verification function
async function verifyCourseAccess(userId, courseId) {


  return true;
  // Implement your access logic, example:
  // const enrollment = await Enrollment.findOne({
  //   user: userId,
  //   course: courseId,
  //   status: 'ACTIVE'
  // });

  // return !!enrollment;
}

const getCoursePrivateFile = catchAsync(async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user?.id; // From authentication middleware

  if (!userId || !fileId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  // Find the file metadata
  const fileDoc = await Upload.findById(fileId);
  if (!fileDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'File not found');
  }

  // Find the associated course
  const course = await Course.findOne({
    'course_objects.files': fileId
  }).populate('course_objects.files');

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  // Find the specific course object
  const courseObject = course.course_objects.find(obj =>
    obj.files._id.equals(fileId)
  );

  //  Check file accessibility
  if (courseObject.status === 'PUBLIC') {
    // return file if it PUBLIC
    return courseService.sendFileDirectly(res, fileDoc.file_name);
  }

  //  Verify user access for private files
  const hasAccess = await verifyCourseAccess(userId, course._id);

  if (!hasAccess) {
      throw new ApiError(httpStatus[403], 'Access denied');
  }

  //  Send the file if all checks pass
  courseService.sendFileDirectly(res, fileDoc.file_name);

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
  deleteCourse,
  getCoursePrivateFile
};
