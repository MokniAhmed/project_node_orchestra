const asyncHandler = require("express-async-handler");
const Candidate = require("../models/candidateModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

exports.getAllCandidates = factory.getAll(Candidate);
