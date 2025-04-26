const httpStatus = require('http-status');
const Coach = require('./coach.model');
const ApiError = require('../../utils/ApiError');

// Models
const UserModel = require('../../models/user.model');

// Get all coaches
const getAllCoaches = async () => {
  return Coach.find().populate('user_id', 'name email'); // Populate user details
};

// Get a specific coach by ID
const getCoachById = async (id) => {
  const coach = await Coach.findById(id).populate('user_id', 'name');
  if (!coach) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coach not found');
  }
  return coach;
};

// create new coach
const createCoach = async (requestBody) => {
  if (!requestBody) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Data Not Valid');
  }

  const newCoach = await Coach.create(requestBody);
  return newCoach;
};

const completeCouchInfo = async (user, coachInfo) => {
  // request data validation
  if (!coachInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coach Information Not found');
  }

  if (!coachInfo?.national_code === ' ' || !coachInfo?.national_code) {
    throw new ApiError(httpStatus.NOT_FOUND, 'National Code Information Not Valid');
  }

  const coach = await UserModel.findById(user.id);

  if (!coach) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coach not found');
  }

  coach.coach_Information = {
    ...coach.coach_Information,
    ...coachInfo,
  };

  await coach.save();
  return coach;
};

// Admin

// Get a specific coach by ID
const getCoachByIdForAdmin = async (id) => {
  const coach = await Coach.findById(id).populate('enrolledCourses.coach_course_program_id');
  if (!coach) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Coach not found');
  }
  return coach;
};

module.exports = {
  getAllCoaches,
  getCoachById,
  getCoachByIdForAdmin,
  createCoach,
  completeCouchInfo,
};
