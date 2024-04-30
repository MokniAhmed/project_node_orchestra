const asyncHandler = require("express-async-handler");

const Season = require("../models/seasonModel");
const Concert = require("../models/concertModel");

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

// @desc    Create new season & desable last season
// @route   POST /api/v1/season/
// @access  public/admin
exports.getseason = asyncHandler(async (req, res, next) => {
  // 1- find last season
  const season = await Season.findOne({ state_season: "new" }).limit(1);
  const concert = await Concert.find({ season: season._id });
  console.log(season._id);
  res.status(200).json({ name: season.name, concert: concert });
});
