const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Repetition = require("../models/repetitionModel");
const User = require("../models/userModel");
const Historic = require("../models/historicModel");

// @desc    add presence to the repetition & concert
// @route   PUT /api/v1/presence/qrcode
// @access  public/chorist
exports.markPrsence = asyncHandler(async (req, res, next) => {
  const { event, rep, concert } = req.body;

  let historic = null;
  if (event === "rep") {
    historic = await Historic.findOneAndUpdate(
      {
        rep,
        event,
        user_sender: req.user._id,
      },
      {
        status: "present",
      },
      { new: true }
    );
  } else {
    historic = await Historic.findOneAndUpdate(
      {
        concert,
        event,
        user_sender: req.user._id,
      },
      {
        status: "present",
      },
      { new: true }
    );
  }
  if (!historic) next(new ApiError("no historic with this data enter.", 400));
  res.status(200).json({ data: historic });
});

// @desc    add presence to the repetition & concert 
// @route   POST /api/v1/presence/add-manualy/:id
// @access  private/admin-chef-chorist
exports.addPrsenceManualy = asyncHandler(async (req, res, next) => {
  const historic = await Historic.findByIdAndUpdate(
    req.params.id,
    {
      status: "present",
    },
    { new: true }
  );
  if (!historic) next(new ApiError("no historic with this Id.", 400));
  res.status(200).json({ data: historic });
});

// @desc    demande absent to rep or concert
// @route   POST /api/v1/presence/demandeAbsent
// @access  private/chorist
exports.demandeAbsent = asyncHandler(async (req, res, next) => {
  const { event, rep, concert } = req.body;

  let historic = null;
  if (event === "rep") {
    historic = await Historic.findOneAndUpdate(
      {
        rep,
        event,
        user_sender: req.user._id,
      },
      {
        status: "absent_demanded",
      },
      { new: true }
    );
  } else {
    historic = await Historic.findOneAndUpdate(
      {
        concert,
        event,
        user_sender: req.user._id,
      },
      {
        status: "absent_demanded",
      },
      { new: true }
    );
  }
  if (!historic) next(new ApiError("no historic with this data enter.", 400));
  res.status(200).json({ data: historic });
});

exports.demandeAbsent = asyncHandler(async (req, res, next) => {});
