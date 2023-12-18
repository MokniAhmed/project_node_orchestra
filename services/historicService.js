const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const Historic = require("../models/historicModel");
const Musical = require("../models/musicalModel");
const Season = require("../models/seasonModel");

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
