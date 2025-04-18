const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const coachService = require('./coach.service');

// Get all coaches
const getAllCoaches = catchAsync(async (req, res) => {
  const coaches = await coachService.getAllCoaches();
  res.status(httpStatus.OK).send(coaches);
});

// Get a specific coach by ID
const getCoachById = catchAsync(async (req, res) => {
  const coach = await coachService.getCoachById(req.params.couch_id);
  res.status(httpStatus.OK).send(coach);
});

// createCoach
const createCoach = catchAsync(async (req, res) => {
  const coach = await coachService.createCoach(req.body);
  res.status(httpStatus.OK).send(coach);
});

module.exports = {
  getAllCoaches,
  createCoach,
  getCoachById,
};
