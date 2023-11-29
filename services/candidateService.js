const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const Condidate = require("../models/candidateModel");
const sendEmail = require("../utils/sendEmail");
const factory = require("./handlersFactory");
// @desc    Create Condidate Not Valide
// @route   PUT /api/v1/condidate/
// @access  public/user
exports.CreateCondidateNotValide = asyncHandler(async (req, res, next) => {
  // 1- Generate token
  const tokenValidate = createToken(req.body.email);
  // 2- create condidatenot valide
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
  console.log(condidate);
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

exports.getAllCandidates = factory.getAll(Condidate);
