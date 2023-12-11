const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

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

    const transformedObject = {};

    result.forEach((item) => {
      const { pupitre, status } = item._id;
      const count = item.count;

      if (!transformedObject[pupitre]) {
        transformedObject[pupitre] = {
          present: 0,
          absent_demanded: 0,
          absent: 0,
          percentage: 0,
        };
      }

      transformedObject[pupitre][status] = count;
    });
    // Calculer le pourcentage de présence
    Object.keys(transformedObject).forEach((pupitre) => {
      const total =
        transformedObject[pupitre].present +
        transformedObject[pupitre].absent_demanded +
        transformedObject[pupitre].absent;

      transformedObject[pupitre].percentage = (
        (transformedObject[pupitre].present / total) *
        100
      ).toFixed(2);
    });
    console.log(transformedObject);
    res.send({ transformedObject });
  }
);




