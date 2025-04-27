const httpStatus = require('http-status');
const ApiError = require('../../utils/ApiError');

const catchAsync = require('../../utils/catchAsync');
const coachService = require('./coach.service');

// Get all coaches
const getAllCoaches = catchAsync(async (req, res) => {
  const coaches = await coachService.getAllCoaches();
  res.status(httpStatus.OK).send(coaches);
});

// Get a specific coach by ID
const getCoachById = catchAsync(async (req, res) => {
  if (req.params.coachId !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to Get this coach information');
  }

  const coach = await coachService.getCoachById(req.params.coachId);
  res.status(httpStatus.OK).send(coach);
});

// createCoach
const createCoach = catchAsync(async (req, res) => {
  const coach = await coachService.createCoach(req.body);
  res.status(httpStatus.OK).send(coach);
});

// update coach coach_Information data
const completeCouchInfo = catchAsync(async (req, res) => {
  if (req.user.id !== req.params.coachId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this coach information');
  }

  const coach = await coachService.completeCouchInfo(req.user, req.body);
  res.status(httpStatus.OK).send(coach);
});

// Admin
// Get a specific coach by ID
const getCoachByIdForAdmin = catchAsync(async (req, res) => {
  const coach = await coachService.getCoachByIdForAdmin(req.params.coachId);
  res.status(httpStatus.OK).send(coach);
});

module.exports = {
  getAllCoaches,
  createCoach,
  getCoachById,
  getCoachByIdForAdmin,
  completeCouchInfo,
};
