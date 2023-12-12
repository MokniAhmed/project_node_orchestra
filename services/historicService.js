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
    user_sender: req.user._id,
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
