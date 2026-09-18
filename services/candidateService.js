/* eslint-disable */
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");

const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const Condidate = require("../models/candidateModel");
const User = require("../models/userModel");
const Audition = require("../models/auditionModel");
const sendEmail = require("../utils/sendEmail");
const factory = require("./handlersFactory");
const getNextAuditionSlot = require("../utils/auditionScheduling");

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
    subject: "Validation Email",
    message: "Please validate your email address.",
    html: `
      <div style="max-width: 600px; margin: auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; font-family: Arial, Helvetica, sans-serif;">
        <h1 style="margin: 0; padding: 20px; background-color: #0369A1; color: white; text-align: center;">Welcome to the ORCHESTRA</h1>
        <div style="padding: 20px; text-align: center; background-color: #F1F5F9;">
          <p style="color: #374151; margin: 20px 0;">Thank you for joining us! Please confirm your email address to complete your registration.</p>
          <a href="http://localhost:5173/token/${tokenValidate}" style="display: inline-block; background-color: #0369A1; color: white; padding: 10px 20px; margin: 20px 0; border-radius: 4px; text-decoration: none;">Validate Email</a>
          <p style="color: #6B7280; margin: 20px 0;">If you didn't request this, please ignore this email.</p>
        </div>
        <footer style="padding: 20px; background-color: #E2E8F0; text-align: center; color: #4B5563;">
          <p>© ORCHESTRA. All rights reserved.</p>
        </footer>
      </div>
    `,
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
  console.log(condidate);
  if (!condidate) {
    return next(new ApiError("token email invalid", 401));
  }
  if (!condidate.validate_mail) {
    console.log("here validate");
    // 2- Validate candidate email
    condidate.token_validate = null;
    condidate.validate_mail = true;

    // 3- Assuming the audition ID is stored in the candidate document (adjust as necessary)
    const auditionId = condidate.audition_id;
    if (!auditionId) return next(new ApiError("There's no audition ID.", 400));

    // 4- Get the audition details
    const audition = await Audition.findById(auditionId).select(
      "planning audition_starting_date nb_candidate_day"
    );
    if (!audition) return next(new ApiError("Audition not found.", 404));

    const { nb_candidate_day, planning, audition_starting_date } = audition;

    const { starting_date: currentDate, order } = getNextAuditionSlot({
      planning, audition_starting_date, nb_candidate_day,
    });

    const candidatePlan = {
      starting_date: currentDate,
      order,
      candidate: condidate._id,
    };
    planning.push(candidatePlan);
    audition.planning = planning;
    await audition.save();
    await sendEmail({
      email: condidate.email,
      subject: "Audition Schedule Confirmation",
      message: "Your audition is confirmed. Please see the details below.",
      html: `
        <html>
          <head>
            <style>
              .email-container { font-family: Arial, Helvetica, sans-serif; color: #4B5563; background-color: #F9FAFB; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
              .header { color: #1F2937; font-size: 24px; font-weight: 800; }
              .body-text { margin-bottom: 16px; }
              .strong { font-weight: bold; }
              .footer { margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <h1 class="header">Audition Confirmation</h1>
              <p class="body-text">Hello ${condidate.firstName},</p>
              <p class="body-text">Thank you for applying for the audition. We are pleased to inform you that your application has been received and scheduled.</p>
              <p class="body-text"><span class="strong">Audition Date and Time:</span> ${currentDate.toLocaleString()}</p>
              <p class="body-text">Please make sure to arrive on time and prepare any necessary materials for your audition.</p>
              <p class="footer">Best regards,<br>Your Audition Team</p>
            </div>
          </body>
        </html>
      `,
    });
    // 5- Save candidate changes
    await condidate.save();
  }
  res.status(200).json({ message: "Candidate processed.", condidate });
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

  const { starting_date: currentDate, order } = getNextAuditionSlot({
    planning, audition_starting_date, nb_candidate_day,
  });

  const candidatePlan = {
    starting_date: currentDate,
    order,
    candidate: newCondidate._id,
  };
  planning.push(candidatePlan);
  //send mail
  audit.planning = planning;
  await audit.save();
  await sendEmail({
    email: newCondidate.email, // Ensure you replace this with the correct variable for the candidate's email
    subject: "Audition Schedule Confirmation",
    message: "Your audition is confirmed. Please see the details below.", // Fallback plain text content
    html: `
      <html>
        <head>
          <style>
            .email-container { font-family: Arial, Helvetica, sans-serif; color: #4B5563; background-color: #F9FAFB; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { color: #1F2937; font-size: 24px; font-weight: 800; }
            .body-text { margin-bottom: 16px; }
            .strong { font-weight: bold; }
            .footer { margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1 class="header">Audition Confirmation</h1>
            <p class="body-text">Hello ${newCondidate.firstName},</p>
            <p class="body-text">Thank you for applying for the audition. We are pleased to inform you that your application has been received and scheduled.</p>
            <p class="body-text"><span class="strong">Audition Date and Time:</span> ${currentDate.toLocaleString()}</p>
            <p class="body-text">Please make sure to arrive on time and prepare any necessary materials for your audition.</p>
            <p class="footer">Best regards,<br>Your Audition Team</p>
          </div>
        </body>
      </html>
    `,
  });
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
      const updatedCondidate = condidate;
      const {
        remark,
        _id,
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
      const placeholderPassword = crypto.randomBytes(32).toString("hex");
      const setupToken = crypto.randomBytes(32).toString("hex");
      const newUser = await User.create({
        ...userProprety,
        role: "chorist",
        group_pupitre: "first",
        password: placeholderPassword,
        status: { statuts: "junior", date: Date.now() },
      });
      newUser.passwordResetCode = crypto
        .createHash("sha256")
        .update(setupToken)
        .digest("hex");
      newUser.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      newUser.passwordResetVerified = false;
      await newUser.save();

      const setupUrl = `http://localhost:5173/set-password?email=${encodeURIComponent(newUser.email)}&resetCode=${encodeURIComponent(setupToken)}`;
      await sendEmail({
        email: condidate.email,
        subject: "Set up your orchestra account",
        message: `Your application has been accepted. Set up your account within 10 minutes: ${setupUrl}`,
        html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
                    <a href="${setupUrl}">Set up your account</a>
                </div>`,
      });
    }

    // 10- save condidate
    await condidate.save();
    // 11- send response
    res.status(200).json({ condidate });
  }
);
