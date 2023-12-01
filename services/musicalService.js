const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const Musical = require("../models/musicalModel");
const factory = require("./handlersFactory");

// @desc    Create new musical
// @route   POST /api/v1/musical/
// @access  private/admin
exports.createMusical = factory.createOne(Musical);

// @desc    update  musical by id
// @route   PUT /api/v1/musical/:id
// @access  private/admin
exports.updateMusical = factory.updateOne(Musical);

// @desc    delete  musical by id
// @route   DELETE /api/v1/musical/:id
// @access  private/admin
exports.deleteMusicalById = factory.deleteOne(Musical);

// @desc    find  musical by id
// @route   GET /api/v1/musical/:id
// @access  private/admin
exports.getMusicalById = factory.getOne(Musical);

// @desc    find  ALL musicals
// @route   GET /api/v1/musical/
// @access  private/admin
exports.getAllMusical = factory.getAll(Musical);
