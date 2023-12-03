const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Concert = require("../models/concertModel");
const Musical = require("../models/musicalModel");

const factory = require("./handlersFactory");
const xlsx = require("xlsx");
const { converExcelToJson } = require("../utils/ExcelToJson");
// @desc    Create Concert
// @route   POST /api/v1/concert/
// @access  public/user
exports.createConcert = asyncHandler(async (req, res, next) => {
  // 1- get data from request
  const concert = { ...req.body };
  // 1- get data from Excel

  const listmusic = converExcelToJson(req.body.path_Excel);
  await Promise.all(
    listmusic.map(async (music) => {
      const newMusic = await Musical.create(music);
      req.body.music.push(newMusic._id);
    })
  );
  // 2- save
  const newConcert = await Concert.create(concert);

  // 3- send response
  res.status(200).json({ newConcert });
});

// @desc    get all Concert
// @route   GET /api/v1/concert/
// @access  public/user
exports.getAllConcerts = factory.getAll(Concert);
// @desc    get  Concert by id
// @route   GET /api/v1/concert/
// @access  public/user
exports.getConcertById = factory.getOne(Concert);

// @desc    DELETE  Concert by id
// @route   DELETE /api/v1/concert/
// @access  public/user

exports.deleteConcertById = factory.deleteOne(Concert);

// @desc    UPDATE  Concert by id
// @route   PUT /api/v1/concert/
// @access  public/user
exports.updateConcertById = factory.updateOne(Concert);
