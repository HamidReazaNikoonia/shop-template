const Coach = require('./coach.model');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('http-status');

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
}

module.exports = {
  getAllCoaches,
  getCoachById,
  createCoach,
};
