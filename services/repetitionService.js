const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");

const Repetition = require("../models/repetitionModel");
const ApiError = require("../utils/apiError");

// test
exports.createRepetition = factory.createOne(Repetition);
exports.updateRepetition = factory.updateOne(Repetition);
exports.deleteRepetition = factory.deleteOne(Repetition);
exports.getAllRepetition = factory.getAll(Repetition);
exports.getRepeitionById = factory.getOne(Repetition);
