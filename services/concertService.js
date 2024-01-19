const asyncHandler = require("express-async-handler");
const Concert = require("../models/concertModel");
const Musical = require("../models/musicalModel");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const Historic = require("../models/historicModel");
const factory = require("./handlersFactory");
const { converExcelToJson } = require("../utils/ExcelToJson");
const ApiError = require("../utils/apiError");

// @desc    Create Concert
// @route   POST /api/v1/concert/
// @access  public/user
exports.createConcert = asyncHandler(async (req, res, next) => {
  // 1- get data from request
  // const concert = { ...req.body };
  // 1- get data from Excel

  /* const listmusic = converExcelToJson(req.body.path_Excel);
  await Promise.all(
    listmusic.map(async (music) => {
      const newMusic = await Musical.create(music);
      concert.music.push(newMusic._id);
    })
  );*/
  // 2- save
  const newConcert = await Concert.create(req.body);

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

// @desc    send mail to confirm to all chorist for one concert
// @route   Post /api/v1/concert/
// @access  public/Admin
exports.checkDisponiblilte = asyncHandler(async (req, res, next) => {
  const chorists = await User.find({
    role: "chorist",
    //status_elimination: "none",
  });
  const emailList = chorists.map((chorist) => chorist.email);
  const choristId = chorists.map((chorist) => chorist._id);
  console.log(choristId);

  const concert = await Concert.findById(req.params.id);

  if (!concert) next(new ApiError("no concert with this ID", 400));

  const { _id: concertId, name, location, date, music } = concert;
  await Promise.all(
    chorists.map(async (chorist) => {
      await Historic.create({
        user_sender: chorist._id,
        pupitre: chorist.group_pupitre,
        event: "concert",
        date: date,
        music: music,
        concert: concertId,
        season: concert.season,
      });
    })
  );

  concert.list_candidate = choristId;
  await concert.save();
  const confirmUrl = `localhost:8000/api/v1/users/confirm-concert/${concertId}`;
  const declineUrl = `localhost:8000/api/v1/users/decline-concert/${concertId}`;

  res
    .status(200)
    .json({ status: "sucess", message: " checking mail has been sent. " });
});

// @desc    list chorist final each pupitre /all chorist
// @route   Get /api/v1/concert/final-list/id/?pupitre=first-
// @access  public/Admin
exports.getFinalList = asyncHandler(async (req, res, next) => {
  const concertId = req.params.id;
  const groupPupitreFilter = req.query.pupitre;

  let filter = {};
  if (groupPupitreFilter) {
    filter = { group_pupitre: groupPupitreFilter };
  }

  const concert = await Concert.findById(concertId)
    .select("list_final")
    .populate({
      path: "list_final",
      match: filter,
      select: "firstName lastName group_pupitre",
    });

  if (!concert) {
    return next(new ApiError("No concert with this id", 400));
  }

  res.status(200).json({ results: concert.length, data: concert.list_final });
});

// test to add to the list final
exports.confirmAllToConcert = asyncHandler(async (req, res, next) => {
  const { id: concertId } = req.params;
  const concert = await Concert.findById(concertId);

  if (!concert) next(new ApiError("there's no concert with this ID", 400));
  if (concert.list_candidate.length === 0)
    next(new ApiError("we can't make final list with no candidates", 400));
  concert.list_final = concert.list_candidate;
  await concert.save();

  res.status(200).json({ message: "added sucessfuly" });
});
// return placement
exports.getPlacement = asyncHandler(async (req, res, next) => {
  const { id: concertId } = req.params;
  const list = await Concert.findById(concertId).select("list_final").populate({
    path: "list_final",
    select: "firstName lastName group_pupitre height gender",
  });
  if (!list) next(new ApiError("there's no list final ", 400));

  const groupedArrays = list.list_final
    .map((person) => ({
      groupKey: person.group_pupitre,
      personData: person,
    }))
    .reduce((groupedData, entry) => {
      const { groupKey, personData } = entry;
      groupedData[groupKey] = groupedData[groupKey] || [];
      groupedData[groupKey].push(personData);
      return groupedData;
    }, {});
  Object.keys(groupedArrays).forEach((groupKey) => {
    groupedArrays[groupKey].sort((a, b) => {
      if (a.gender === "male" && b.gender === "female") {
        return 1;
      }
      if (a.gender === "female" && b.gender === "male") {
        return -1;
      }
      return b.height - a.height;
    });
  });
  res.status(200).json({ message: "done", resualt: groupedArrays });
});
