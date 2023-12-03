/* eslint-disable */
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const Condidate = require("../models/candidateModel");
const User = require("../models/userModel");
const Audition = require("../models/auditionModel");
const sendEmail = require("../utils/sendEmail");
const factory = require("./handlersFactory");

// @desc    Create Condidate Not Valide
// @route   POST /api/v1/condidate/
// @access  public/user
exports.CreateCondidateNotValide = asyncHandler(async (req, res, next) => {
  // 1- Generate token
  const tokenValidate = createToken(req.body.email);
  // 2- create condidate not valide
  const condidate = await Condidate.create({
    ...req.body,
    token_validate: tokenValidate,
  });
  // 3- send email
  sendEmail({
    email: req.body.email,
    subject: "validation email",
    message: "ekjneknke",
    html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
        <h1 style="width: 100%;color: white; background-color:rgb(0, 229, 255);text-align: center ; padding: 10px 0px">ORCHESTRE</h1>
        <a href="/token/${tokenValidate}" style="margin-top: 100px;  padding: 10px 20px;color: white; background-color:rgb(0, 229, 255) ;">Valide email </a>
    </div>`,
  });
  res.status(200).json({ condidate });
});

// @desc    validate email condidate with token
// @route   PUT /api/v1/condidate/:token
// @access  public/user
exports.ValidateCondidate = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  console.log(req.params, token);
  // 1- find condidate by token_validate
  const condidate = await Condidate.findOne({
    token_validate: token,
  });
  if (!condidate) {
    return next(new ApiError("token email invalid", 401));
  }
  // 2- update condidate to valide
  condidate.token_validate = null;
  condidate.validate_mail = true;
  // 3- save condidate
  await condidate.save();
  // 4- send response
  res.status(200).json({ condidate });
});

//for test
// @desc    create new candidate
// @route   POST /api/v1/condidate/new
// @access  public/user
exports.createNewCandidate = asyncHandler(async (req, res, next) => {
  const newCondidate = await Condidate.create(req.body);
  //get the audit id
  const auditId = newCondidate.audition_id;
  if (!auditId) return next(new ApiError("there's no audit Id.", 400));
  // get the attribute pllanning array and starting aution and nb candidate per day
  const audit = await Audition.findById(auditId).select(
    "planning audition_starting_date nb_candidate_day"
  );
  // destrcution
  const { nb_candidate_day, planning, audition_starting_date } = audit;

  // Calculate the starting date for the new candidate

  let currentDate;
  let order;
  // first candidate  get the order 1 and the date is the starting date at 9am
  if (planning.length === 0) {
    currentDate = new Date(audition_starting_date);
    //ybda 9 Am
    currentDate.setHours(9, 0, 0);
    order = 1;
  } else {
    // if no the first candidate he take the last one and we calculate the date depende on the last one
    const lastCandidate = planning[planning.length - 1];
    // we still can accpet candidate in that day
    if (lastCandidate.order <= nb_candidate_day) {
      currentDate = new Date(
        lastCandidate.starting_date.getTime() +
          lastCandidate.duration * 60 * 1000
      );
      order = lastCandidate.order + 1;
    } else {
      //we get the limit of the day and we gonna start from the next day we reset the order and we increment the day +1
      currentDate = new Date(lastCandidate.starting_date);
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(9, 0, 0);
      order = 1;
    }
  }

  const candidatePlan = {
    starting_date: currentDate,
    order,
    candidate: newCondidate._id,
  };
  planning.push(candidatePlan);
  audit.planning = planning;
  await audit.save();

  res.status(201).json({ data: newCondidate });
});

exports.getAllCandidates = factory.getAll(Condidate);

exports.getOneCandidate = factory.getOne(Condidate);

// @desc    update infos for audition for each condidate
// @route   PUT /api/v1/condidate/:id
// @access  private/admin
exports.updateInfosAuditionForCondidate = factory.updateOne(Condidate);

// @desc    Delete condidate
// @route   Delete /api/v1/condidate/:id
// @access  private/admin
exports.deleteCondidateById = factory.deleteOne(Condidate);

// @desc    send email to accepted condidates
// @route   GET /api/v1/condidate/accepted
// @access  private/admin0
exports.acceptetionCandidateEmails = asyncHandler(async (req, res, next) => {
  // 1- find all candidate accepted
  const condidatesAccepted = await Condidate.find({
    status: "accepted",
  });
  if (!condidatesAccepted || condidatesAccepted.length === 0) {
    return next(new ApiError("not have candidates accepted", 401));
  }
  var newListAccepted = [];

  // 2- map  candidate accepted
  await Promise.all(
    condidatesAccepted.map(async (candidate) => {
      // 3- Generate tokenValidate for candidate accepted
      const tokenValidate = createToken(candidate.email);
      // 4- update candidate (add token_validate)
      const condidateN = await Condidate.findByIdAndUpdate(
        candidate._id,
        {
          token_validate: tokenValidate,
        },
        { new: true }
      );
      if (!condidateN) {
        return next(new ApiError("condidate  invalid", 401));
      }
      newListAccepted.push(condidateN);
      // 5- send email
      sendEmail({
        email: candidate.email,
        subject: "acceptation email",
        message: "ekjneknke",
        html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
                     <a href="/token/${tokenValidate}" style="margin-top: 100px;  padding: 10px 20px;color: white; background-color:rgb(0, 229, 255) ;">accepted </a>
                </div>`,
      });
    })
  );

  // 6- return response
  res.status(200).json({ newListAccepted });
});

// @desc    confimed or cansled acceptation condidate
// @route   PUT /api/v1/condidate/response/:token
// @access  public/user
exports.responseCondidateForAcceptation = asyncHandler(
  async (req, res, next) => {
    const { token } = req.params;
    const { response } = req.body;
    // 1- find condidate by token_validate
    const condidate = await Condidate.findOne({
      token_validate: token,
    });
    if (!condidate) {
      return next(new ApiError("token email invalid", 401));
    }
    // 2- check if condidate
    if (condidate.status !== "accepted") {
      return next(new ApiError("you are not accepted", 403));
    }
    // 3- update  token_validate to null
    condidate.token_validate = null;
    // 4- check body.response
    if (!response) {
      condidate.status = "cancelled";
    } else {
      condidate.status = "accepted_confimed";
      // 5- delete audtion proprety from condidate object
      const {
        remark,
        range,
        appreciation,
        piece_of_music,
        status,
        nb_ordre,
        token_validate,
        validate_mail,
        createdAt,
        updatedAt,
        audition_id,
        __v,
        ...userProprety
      } = condidate.toJSON();
      const password = Math.random() // 7-  Generate random number, eg: 0.123456
        .toString(36) // Convert  to base-36 : "0.4fzyo82mvyr"
        .slice(-8); // Cut off last 8 characters : "yo82mvyr"
      // 8- create new user
      const newUser = await User.create({
        ...userProprety,
        role: "chorist",
        group_pupitre: "first",
        password,
      });
      // 9- send email with password
      sendEmail({
        email: candidate.email,
        subject: "accepted email",
        message: "ekjneknke",
        html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
                    <h1>your password:${newUser.password}</h1>
                </div>`,
      });
    }

    // 10- save condidate
    await condidate.save();
    // 11- send response
    res.status(200).json({ condidate });
  }
);
