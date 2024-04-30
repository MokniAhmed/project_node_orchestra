const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Historic = require("../models/historicModel");
const Musical = require("../models/musicalModel");
const Season = require("../models/seasonModel");
const factory = require("./handlersFactory");
const User = require("../models/userModel");

// @desc    get hisotry d activite
// @route   POST /api/v1/history/
// @access  private/user
exports.getHistoryByUser = asyncHandler(async (req, res, next) => {
  const seasonState = req.query.seasonState || undefined;
  const musicName = req.query.music || undefined;

  // Define the base query without season conditions
  const baseQuery = {
    user_sender: req.params.id,
    status: "present",
  };
  // Add season conditions based on the provided seasonState
  if (seasonState) {
    if (seasonState === "new") {
      const newSeason = await Season.findOne({ state_season: "new" }, "_id");

      if (newSeason) {
        baseQuery.season = newSeason._id;
      }
    } else {
      const oldSeason = await Season.findOne(
        { state_season: { $ne: "new" } },
        "_id"
      );

      if (oldSeason) {
        baseQuery.season = oldSeason._id;
      }
    }
  }
  // Add music condition if provided
  if (musicName) {
    const musicId = await Musical.findOne({ title: musicName }, "_id");
    if (musicId) {
      baseQuery.music = musicId;
    }
  }

  const history = await Historic.find(baseQuery)
    .populate({ path: "music", select: "title " })
    .populate({
      path: "concert",
      select: "name day",
    });
  const concertHistory = history.filter((item) => item.event === "concert");
  const nbConcert = concertHistory.length;
  const nbReptition = history.length - nbConcert;

  res.status(200).json({ nbReptition, nbConcert, concerts: concertHistory });
});

exports.getStatistique = asyncHandler(async (req, res, next) => {
  if (!req.query.critere)
    next(new ApiError("there no query to generate statistique ", 400));
  let aggregationPipeline;

  switch (req.query.critere) {
    case "concert":
      aggregationPipeline = [
        {
          $group: {
            _id: "$concert",
            presentConcert: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "present"] },
                      { $eq: ["$event", "concert"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },

            absentConcert: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "absent"] },
                      { $eq: ["$event", "concert"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            presentRep: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "present"] },
                      { $eq: ["$event", "rep"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            absentRep: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "absent"] },
                      { $eq: ["$event", "rep"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },

        {
          $lookup: {
            from: "concerts",
            localField: "_id",
            foreignField: "_id",
            as: "concertInfo",
          },
        },
        {
          $unwind: "$concertInfo",
        },
        {
          $project: {
            _id: 0,
            concertName: "$concertInfo.name",
            presentConcert: 1,
            absentConcert: 1,
            presentRep: 1,
            absentRep: 1,
          },
        },
      ];

      break;
    case "chorist":
      aggregationPipeline = [
        {
          $group: {
            _id: "$user_sender",
            presentConcert: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "present"] },
                      { $eq: ["$event", "concert"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            absentConcert: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "absent"] },
                      { $eq: ["$event", "concert"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            presentRep: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "present"] },
                      { $eq: ["$event", "rep"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
            absentRep: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ["$status", "absent"] },
                      { $eq: ["$event", "rep"] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "chorist",
          },
        },
        {
          $unwind: "$chorist",
        },
        {
          $project: {
            _id: 0,
            choristName: "$chorist.firstName",

            presentConcert: 1,
            absentConcert: 1,
            presentRep: 1,
            absentRep: 1,
          },
        },
      ];

      break;
    case "oeuvre":
      aggregationPipeline = [
        {
          $unwind: "$music",
        },
        {
          $group: {
            _id: {
              user_sender: "$user_sender",
              music: "$music",
            },
            musicCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.user_sender",
            musicDetails: {
              $push: {
                music: "$_id.music",
                musicCount: "$musicCount",
              },
            },
          },
        },
      ];

      break;
    default:
      next(new ApiError("Invalid critere value", 400));
  }
  const stats = await Historic.aggregate(aggregationPipeline);

  res.status(200).json(stats);
});

// test add presence to all the user based on the even by percentage
exports.addPrsenceAutomatiqly = asyncHandler(async (req, res, next) => {
  const { event } = req.query;

  const history = await Historic.updateMany(
    { event, status: "absent" },
    { status: "present" }
  );
  res.status(200).json(history);
});

// @desc    get absent etat
// @route   POST /api/v1/history/
// @access  private/admin
exports.etatAbsentStat = asyncHandler(async (req, res, next) => {
  if (!req.query.genre && !req.query.period) {
    return next(
      new ApiError("Request needs both genre and period queries", 400)
    );
  }
  if (
    req.query.genre !== "pupitre" &&
    req.query.genre !== "chorist" &&
    req.query.genre !== "general"
  ) {
    return next(
      new ApiError(
        "Invalid genre value. Accepted values are 'pupitre' or 'chorist' or 'general'",
        400
      )
    );
  }
  if (req.query.period) {
    if (
      req.query.period !== "day" &&
      req.query.period !== "since" &&
      req.query.period !== "period"
    ) {
      return next(
        new ApiError(
          "Invalid period value. Accepted values are 'day', 'since', or 'period'",
          400
        )
      );
    }
  }

  // Base aggregation pipeline
  const basePipeline = [
    {
      $match: { event: "rep" },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ];

  // Modify match and group stages based on genre
  if (req.query.genre === "pupitre") {
    basePipeline[1] = {
      $group: {
        _id: { pupitre: "$pupitre" },
        count: { $sum: 1 },
        presentRep: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$status", "present"] },
                  { $eq: ["$event", "rep"] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        absentRep: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$status", "absent"] },
                  { $eq: ["$event", "rep"] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
      },
    };
    basePipeline.push({
      $project: {
        _id: 0,
        pupitre: "$_id.pupitre",
        count: "$count",
        presentRep: "$presentRep",
        absentRep: "$absentRep",
      },
    });
  } else if (req.query.genre === "chorist") {
    basePipeline[1] = {
      $group: {
        _id: { user_sender: "$user_sender" },
        presentRep: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$status", "present"] },
                  { $eq: ["$event", "rep"] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        absentRep: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$status", "absent"] },
                  { $eq: ["$event", "rep"] },
                ],
              },
              then: 1,
              else: 0,
            },
          },
        },
        count: { $sum: 1 },
      },
    };
    basePipeline.push({
      $lookup: {
        from: "users",
        localField: "_id.user_sender",
        foreignField: "_id",
        as: "userDetails",
      },
    });
    // Add $unwind stage to destructure the user details array
    basePipeline.push({
      $unwind: "$userDetails",
    });
    // Add $project stage to reshape the output
    basePipeline.push({
      $project: {
        _id: 0,
        chorist: "$userDetails.firstName", // Replace with the actual field you want
        count: "$count",
        presentRep: "$presentRep",
        absentRep: "$absentRep",
      },
    });
  }

  // Modify match stage based on period
  if (req.query.period === "day") {
    basePipeline[0].$match.date = new Date(req.query.startday);
  } else if (req.query.period === "since") {
    basePipeline[0].$match.date = { $gte: new Date(req.query.date) };
  } else if (req.query.period === "period") {
    basePipeline[0].$match.date = {
      $gte: new Date(req.query.startdate),
      $lte: new Date(req.query.enddate),
    };
  }

  const stats = await Historic.aggregate(basePipeline);

  res.status(200).json(stats);
});

// @desc    Get list of Historic
// @route   POST /api/v1/history/

exports.getAbsList = factory.getAll(Historic);

// @desc    nomination choriste
// @route   POST /api/v1/history/
// @access  private/chorist
exports.nominatedorabsentchoriste = asyncHandler(async (req, res, next) => {
  // find user by id
  const user = await User.findById(req.params.id);
  const nbAbs = user.nb_absence;
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  // find current active season
  const ActiveSeason = await Season.findOne({ state_season: "new" });

  // get max absence per season
  const maxAbs = ActiveSeason.max_absence;
  const nominamtions = ActiveSeason.nomination;

  //change elimination status
  if (nbAbs > nominamtions && nbAbs < maxAbs) {
    ActiveSeason.nominatedMembers.push({
      memberId: user._id,
      nom: user.nom,
    });
  } else if (nbAbs > maxAbs) {
    ActiveSeason.absentMembers.push({
      memberId: user._id,
      nom: user.firstName,
    });
  }
  console.log(user.status_elimination);

  await ActiveSeason.save();

  res.status(204).json({ message: "success" });
});

exports.profilDetail = asyncHandler(async (req, res, next) => {
  const history = await Historic.countDocuments({
    user_sender: req.params.id,
    status: "present",
  });

  const user = await User.findById(req.params.id);

  const newStatus = {
    statuts: "",
    date: new Date(),
  };

  if (history === 1) {
    newStatus.statuts = "junior";
  } else if (history > 1 && history < 3) {
    newStatus.statuts = "choriste junior";
  } else {
    newStatus.statuts = "senior";
  }

  user.status.push(newStatus);

  await user.save();

  res.status(204).json({ message: "success" });
});
