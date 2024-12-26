const {Course, CourseCategory} = require('./course.model');
const APIFeatures = require('../../utils/APIFeatures');
const User = require('../../models/user.model'); // Assuming User model exists

const applyForCourse = async ({ courseId, userId }) => {
  const courseDoc = await Course.findById(courseId);
  if (!courseDoc) {
    throw new Error('Course not found');
  }

  const userDoc = await User.findById(userId);
  if (!userDoc) {
    throw new Error('User not found');
  }

  // Check if course is full
  if (courseDoc.member.length >= courseDoc.max_member_accept) {
    throw new Error('This course has reached its maximum number of members.');
  }

  // Check if the user is already a member
  const isUserAlreadyMember = courseDoc.member.some(
    (member) => member.user.toString() === userId
  );
  if (isUserAlreadyMember) {
    throw new Error('User is already a member of this course.');
  }

  // Add user to course members
  courseDoc.member.push({ user: userId });
  await courseDoc.save();

  return courseDoc;
};

const getAllCourses = async ({query}) => {
  const features = new APIFeatures(Course.find({ 'course_status': true }), query)
  .filter()
  .search()
  // .priceRange() // Apply the price range filter
  // .sort()
  .dateFilter()
  .limitFields()
  .paginate();

const courses = await features.query;
const total = await new APIFeatures(Course.find({ 'course_status': true }), query)
  .filter()
  .search()
  .dateFilter()
  // .priceRange() // Apply the price range filter
  .count().total;

return { data: { total, count: courses.length, courses } };
};

const getCourseBySlugOrId = async (identifier) => {
  // const query = identifier._id ? { _id: identifier._id } : { slug: identifier.slug };
  console.log(identifier)
  return await Course.findOne(identifier);
};

const createCourse = async (courseData) => {
  const course = new Course(courseData);
  return await course.save();
};

const updateCourse = async (courseId, updatedData) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  Object.assign(course, updatedData);
  await course.save();

  return course;
};

const deleteCourse = async (courseId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  await course.deleteOne();
};


// Course Category

const getAllCourseCategories = async () => {
  return await CourseCategory.find();
};


const createCourseCategory = async (courseData) => {
  const newCategory = new CourseCategory(courseData);
  return await newCategory.save();
};

module.exports = {
  getAllCourses,
  getCourseBySlugOrId,
  createCourse,
  applyForCourse,
  getAllCourseCategories,
  createCourseCategory,
  deleteCourse,
  updateCourse
};
