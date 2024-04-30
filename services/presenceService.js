const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const factory = require("./handlersFactory");

const ApiError = require("../utils/apiError");
const Repetition = require("../models/repetitionModel");
const User = require("../models/userModel");
const Historic = require("../models/historicModel");
const { arrayToJson } = require("../utils/arrayToJson");

// @desc    add presence to the repetition & concert
// @route   PUT /api/v1/presence/qrcode
// @access  public/chorist
exports.markPrsence = asyncHandler(async (req, res, next) => {
  const { event, rep, concert } = req.body;
  console.log(req.user._id);

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
  // if (!historic) next(new ApiError("no historic with this data enter.", 400));
  res.status(200).json({ message: "user mark present" });
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

// @desc    nbr_presence_in_season_for_any_pupitre
// @route   POST /api/v1/presence/nbr_presence_in_season_for_any_pupitre/:id
// @access  private/chorist
exports.getPorcentagePresenceInSeasonForAnyPupitre = asyncHandler(
  async (req, res, next) => {
    const ObjectId = mongoose.Types.ObjectId;

    const result = await Historic.aggregate([
      {
        $match: { season: ObjectId(req.params.id) },
      },
      {
        $group: {
          _id: { pupitre: "$pupitre", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          pupitre: 1,
        },
      },
    ]);

    const transformedObject = arrayToJson(result);

    console.log(transformedObject);
    res.send({ transformedObject });
  }
);

// @desc    nbr_presence_in_Concert_for_any_pupitre
// @route   POST /api/v1/presence/nbr_presence_in_concert_for_any_pupitre/:id
// @access  private/chorist
exports.getPorcentagePresenceInConcertForAnyPupitre = asyncHandler(
  async (req, res, next) => {
    const ObjectId = mongoose.Types.ObjectId;

    const result = await Historic.aggregate([
      {
        $match: { concert: ObjectId(req.params.id) },
      },
      {
        $group: {
          _id: { pupitre: "$pupitre", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          pupitre: 1,
        },
      },
    ]);

    const transformedObject = arrayToJson(result);
    res.send({ transformedObject });
  }
);

// @desc    Get list of Historic
// @route   GET /api/v1/presence
// @access  Private/Admin
exports.getHistoric = factory.getAll(Historic);
