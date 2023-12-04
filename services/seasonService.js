const asyncHandler = require("express-async-handler");

const Season = require("../models/seasonModel");

// @desc    Create new season & desable last season
// @route   POST /api/v1/season/
// @access  public/admin
exports.CreateSeason = asyncHandler(async (req, res, next) => {
  // 1- find last season
  const season = await Season.find().sort({ createdAt: -1 }).limit(1);
  // 2- update last season  "archived"
  season[0].state_season = "archived";
  await season[0].save();
  // 3- create new season
  const newSeason = await Season.create({
    ...req.body,
  });
  res.status(200).json({ newSeason });
});
