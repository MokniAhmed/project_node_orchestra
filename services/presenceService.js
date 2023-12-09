const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Repetition = require("../models/repetitionModel");
const User = require("../models/userModel");

// @desc    add presence to the repetition
// @route   POST /api/v1/presence/
// @access  public/chorist
exports.markPrsence = asyncHandler(async (req, res, next) => {
  const repetition = await Repetition.findById(req.params.id);
  if (!repetition)
    next(new ApiError("there s no repetition with this ID.", 400));
  /* const { end_rep: endingRep } = repetition;
  if (Date.now() > endingRep + 5 * 60 * 1000) {
    next(new ApiError("this no valid anymore ", 400));
  }*/
  repetition.list_presence.push(req.user.id);
  await repetition.save();
  res
    .status(200)
    .json({ status: "sucess", message: "presence has added successfully" });
});

// @desc    add presence to the repetition by email
// @route   POST /api/v1/presence/
// @access  private/admin-chef-chorist
exports.addPrsenceManualy = asyncHandler(async (req, res, next) => {
  const repetition = await Repetition.findById(req.params.id);
  if (!repetition) next(new ApiError("no repetition with this ID.", 400));
  const choristId = await User.findOne({ email: req.body.email }).select("_id");
  if (!choristId) next(new ApiError("no chorist with this Email .", 400));
  const { list_presence: listPresence } = repetition;
  listPresence.push(choristId);
  repetition.list_presence = listPresence;
  await repetition.save();
  res.status(200).json({ message: "presence has been added sucessfulyy " });
});
