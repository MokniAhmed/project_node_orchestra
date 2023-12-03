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
exports.getAllConcerts = asyncHandler(async (req, res, next) => {
  //1 - get all concerts
  const concerts = await Concert.find();
  res.status(200).json({ data: concerts });
});

// @desc    get  Concert by id
// @route   GET /api/v1/concert/
// @access  public/user
exports.getConcertById = asyncHandler(async (req, res, next) => {
  //1 - get  concert by id
  const { id } = req.params;

  const concert = await Concert.findById(id);
  //2- verification concert if he doesn't exist
  if (!concert) {
    return next(new ApiError("concert is invalid", 401));
  }
  //3- send response
  res.status(200).json({ concert });
});

// @desc    DELETE  Concert by id
// @route   DELETE /api/v1/concert/
// @access  public/user

exports.deleteConcertById = asyncHandler(async (req, res, next) => {
  //1 - get  concert by id
  const { id } = req.params;

  const concert = await Concert.findByIdAndDelete(id);
  //2- verification concert if he doesn't exist
  if (!concert) {
    return next(new ApiError("concert is invalid", 401));
  }
  //3- send response
  res.status(200).json({ message: "deleted successfully" });
});

// @desc    UPDATE  Concert by id
// @route   PUT /api/v1/concert/
// @access  public/user
exports.updateConcertById = asyncHandler(async (req, res, next) => {
  //1 - get  concert by id and update it
  const { id } = req.params;

  const concert = await Concert.findByIdAndUpdate(
    id,
    {
      ...req.body,
    },
    { new: true }
  );
  //2- verification concert if he doesn't exist
  if (!concert) {
    return next(new ApiError("concert is invalid", 401));
  }
  //3- send response
  res.status(200).json({ concert });
});
