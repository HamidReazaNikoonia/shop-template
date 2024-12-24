const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');

const Profile = require('./profile.model');



const getProfile = async (userId) => {
  const profile = await Profile.findOne({ user_id: userId })
  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  return profile;
};

const updateProfile = async (userId, updateData) => {
  let profile = await Profile.findOne({ user_id: userId });
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

module.exports = {
  getProfile,
  updateProfile,
};

