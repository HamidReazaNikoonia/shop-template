const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const profileService = require('./profile.service');

// Get a user's profile
const getProfile = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const profile = await profileService.getProfile(user_id);
  res.status(httpStatus.OK).send(profile);
});

// Update liked products or courses
const updateProfile = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const { likedProduct, likedCourse } = req.body;

  const updatedProfile = await profileService.updateProfile(user_id, {
    likedProduct,
    likedCourse,
  });

  res.status(httpStatus.OK).send(updatedProfile);
});

module.exports = {
  getProfile,
  updateProfile,
};
