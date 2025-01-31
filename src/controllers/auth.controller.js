const httpStatus = require('http-status');
const randomstring = require('randomstring');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { authService, userService, tokenService, emailService } = require('../services');
const { Lookup } = require('../services/sms/smsProvider');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const loginByOTP = catchAsync(async (req, res) => {
  const { mobile, name, family } = req.body;

  const user = await authService.getUserForOTP({ mobile, name, family });

  // generate OTP
  const otpStri = randomstring.generate({
    length: 6,
    charset: 'numeric',
  });

  await Lookup(user.mobile, otpStri);

  user.otp = otpStri;
  await user.save();

  // Send OTP By SMS to User

  // const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user });
});

const validateOTPLogin = catchAsync(async (req, res) => {
  const { otpCode, userId } = req.body;

  if (!otpCode) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'OTP code not exist');
  }

  if (!userId) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'User id not exist');
  }

  // validate User OTP by database
  const userDoc = await userService.getUserById(userId);

  if (!userDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User Not Exist');
  }

  if (userDoc.otp !== otpCode) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP code not correct');
  }

  // generate Token
  const tokens = await tokenService.generateAuthTokens(userDoc);

  res.send({ userDoc, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  loginByOTP,
  validateOTPLogin,
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
