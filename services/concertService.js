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

  /*   sendEmail({
    email: emailList,
    subject: "notifer admin",
    message: "Number of new candidates created ",
    html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
      <h1 style="width: 100%;color: white; background-color:rgb(0, 229, 255);text-align: center ; padding: 10px 0px">ORCHESTRE</h1>
      <div>we have ${name} in ${location} ${date}  we need your confiratiom  
      if yes :${confirmUrl} or
      
      no
      </div>
  </div>`,
  }); */
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
