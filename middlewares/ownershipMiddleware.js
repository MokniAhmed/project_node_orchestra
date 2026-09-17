const asyncHandler = require('express-async-handler');
const Break = require('../models/breaksModel');
const ApiError = require('../utils/apiError');

exports.breakOwnerOrAdmin = asyncHandler(async (req, res, next) => {
  const request = await Break.findById(req.params.id);
  if (!request) return next(new ApiError('Break request not found', 404));
  if (req.user.role !== 'admin' && String(request.user_sender) !== String(req.user._id)) {
    return next(new ApiError('You are not allowed to access this request', 403));
  }
  next();
});

exports.pendingBreak = asyncHandler(async (req, res, next) => {
  const request = await Break.findById(req.params.id);
  if (!request) return next(new ApiError('Break request not found', 404));
  if (request.status_request !== 'pending') {
    return next(new ApiError('This break request can no longer be edited', 403));
  }
  next();
});

exports.historyOwnerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && String(req.params.id) !== String(req.user._id)) {
    return next(new ApiError('You are not allowed to access this history', 403));
  }
  next();
};
