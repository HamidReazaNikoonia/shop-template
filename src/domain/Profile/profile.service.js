const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');

const Profile = require('./profile.model');

const { Order } = require('../shop/Order/order.model');
const {Course} = require('../Course/course.model');



// create Profile Service
const createProfile = async (userId) => {
  const profile = await Profile.create({ user: userId });
  return profile;
}



const getProfile = async (userId) => {
   // get User Orders
   const UserOrders = await Order.find({ customer: userId });

   const courses = [];

   // Get ALl User Courses from User Orders
   if (Array.isArray(UserOrders)) {
    if (UserOrders.length !== 0) {
        for (let orderItem of UserOrders) {
          for (let orderProducts of orderItem.products) {
            if (orderProducts.course) {
              courses.push(orderProducts.course);
            }
          }
        }
    }
   }

  //  // Get Users courses
  //  const userCourses = await Course.find({ user: user.id });

  //  // Get User Favorites [Product, Course]
  //  return { user, orders: UserOrders };
  const profile = await Profile.findOne({ user: userId })
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  return {profile, orders: UserOrders, courses};
};

const updateProfile = async (userId, updateData) => {
  let profile = await Profile.findOne({ user: userId });
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }

  if (updateData.likedProduct) {
    profile.likedProduct = updateData.likedProduct;
  }
  if (updateData.likedCourse) {
    profile.likedCourse = updateData.likedCourse;
  }

  await profile.save();
  return profile;
};


const getUserCourse = async ({userId, courseId}) => {
  //  check if user exist and authenticate
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
  }

  // get Specific Course
  const specificCourse = await Course.findById(courseId);

   // get user profile
    const profile = await  Profile.findOne({ user: userId });


  // check if course exist
  if (!specificCourse) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  // check if Profile not Exist
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }


  // check if User Have Access to this course
  const userCourseAccess = profile.courses.includes(courseId);



  return {course: specificCourse, userCourseAccess, profile};



}

module.exports = {
  getProfile,
  updateProfile,
  getUserCourse,
  createProfile
};

