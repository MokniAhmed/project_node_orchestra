const asyncHandler = require("express-async-handler");

const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

const Break = require("../models/breaksModel");
const User = require("../models/userModel");

// @desc    Create Break
// @route   POST  /api/v1/breaks
// @access  Private/user
exports.createBreak = asyncHandler(async (req, res, next) => {
  req.body.user_sender = req.user._id;
  const breakUser = await Break.create({ ...req.body });
  res.status(200).json({ data: breakUser });
});

// @desc    Get list of Breaks
// @route   GET /api/v1/breaks
// @access  Private/Admin
exports.getBreaks = factory.getAll(Break);

// @desc    Get specific Break by id
// @route   GET /api/v1/breaks/:id
// @access  Private/user
exports.getBreakById = factory.getOne(Break);

// @desc    Delete specific Break
// @route   DELETE /api/v1/Breaks/:id
// @access  Private/Admin
exports.deleteBreakById = factory.deleteOne(Break);

// @desc    UPDTAE specific Break
// @route   update /api/v1/Breaks/:id
// @access  Private/user
exports.updateInfoBreakById = asyncHandler(async (req, res, next) => {
  const breakUser = await Break.findById(req.params.id);
  if (!breakUser) {
    return next(new ApiError(`break is not found`, 404));
  }
  const { end_date, start_date, reason } = req.body;
  if (breakUser.status_request !== "pending") {
    return next(
      new ApiError(
        `you can't update breaks with status (rejected,accepted)`,
        404
      )
    );
  }
  breakUser.start_date = start_date;
  breakUser.end_date = end_date;
  breakUser.reason = reason;

  await breakUser.save();
  res.status(200).json({ data: breakUser });
});

// @desc    UPDTAE status specific Break
// @route   update /api/v1/Breaks/status/:id
// @access  Private/Admin
exports.updateStatusBreakById = asyncHandler(async (req, res, next) => {
  // 1- find break by id and change responsible curent user and status status_request
  const breakUser = await Break.findByIdAndUpdate(
    req.params.id,
    {
      responsible: req.user._id,
      status_request: req.body.status_request,
    },
    { new: true }
  );
  if (!breakUser) {
    return next(new ApiError(`break is not found`, 404));
  }
  // 2- find user by id
  const user = await User.findById(breakUser.user_sender);
  if (!user) {
    return next(new ApiError(`user is not found`, 404));
  }
  // 3- update list_muted
  const startDate = new Date(breakUser.start_date);
  const endDate = new Date(breakUser.end_date);

  // Initialize the result array
  const daysList = [];

  // Loop through the days and add them to the list
  for (
    let currentDate = startDate;
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    daysList.push(new Date(currentDate));
  }

  user.list_muted = [...new Set([...user.list_muted, ...daysList])];

  await user.save();
  res.status(200).json({ user: user, breakUser });
});
