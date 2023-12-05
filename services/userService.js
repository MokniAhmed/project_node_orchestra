const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const Concert = require("../models/concertModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const createToken = require("../utils/createToken");
const User = require("../models/userModel");
const season = require("../models/seasonModel");
const Season = require("../models/seasonModel");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = factory.getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = factory.getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private/Admin
exports.createUser = factory.createOne(User);

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = factory.deleteOne(User);

// @desc    Get Logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc    Update logged user password
// @route   PUT /api/v1/users/updateMyPassword
// @access  Private/Protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc    Update logged user data (without password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/Protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    { new: true }
  );

  res.status(200).json({ data: updatedUser });
});

// @desc    Deactivate logged user
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/Protect
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});

// @desc    update user status
// @route   put /api/v1/users/status/
// @access  Private/Protect
exports.updateStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const role = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, role, {
    new: true,
  });
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  res.status(204).json({ message: "success" });
});

// @desc    update elimination status
// @route   put /api/v1/users/elimination_status/
// @access  Private/Protect
exports.eliminationStatus = asyncHandler(async (req, res, next) => {
  // find user by id
  const user = await User.findById(req.params.id);
  let nbAbs = user.nb_absence;

  // find current active season
  const ActiveSeason = await Season.findOne({ state_season: "new" });

  // get max absence per season
  const maxAbs = ActiveSeason.max_absence;

  //change elimination status
  if (nbAbs > maxAbs) {
    user.status_elimination = "absence";
  } else {
    user.status_elimination = "disciplinary";
  }
  console.log(user.status_elimination);

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  await user.save();

  res.status(204).json({ message: "success" });
// @desc    confirm disponibility
// @route   put /api/v1/users/confirm/id
// @access  Private/Protect
exports.confirmPresence = asyncHandler(async (req, res, next) => {
  const concert = await Concert.findById(req.params.id);
  if (!concert) next(new ApiError("no concert found with this ID.", 400));
  const { list_final: listFinal, list_candidate: candidateList } = concert;
  if (!candidateList.includes(req.user._id))
    next(new ApiError("your not invited ", 403));
  listFinal.push(req.user._id);
  concert.list_final = listFinal;
  await concert.save();
  res
    .status(200)
    .json({ status: "sucess", message: "added to the final list" });
});

// @desc    update testiture vocale
// @route   put /api/v1/users/testiture/
// @access  Private/Protect
exports.eliminationStatus = asyncHandler(async (req, res, next) => {
  // find user by id
  const user = await User.findById(req.params.id);
  let nbAbs = user.nb_absence;

  // find current active season
  const ActiveSeason = await Season.findOne({ state_season: "new" });

  // get max absence per season
  const maxAbs = ActiveSeason.max_absence;

  //change elimination status
  if (nbAbs > maxAbs) {
    user.status_elimination = "absence";
  } else {
    user.status_elimination = "disciplinary";
  }
  console.log(user.status_elimination);

  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }
  await user.save();

  res.status(204).json({ message: "success" });
});

exports.updateTestitureVocale = factory.updateOne(User);
