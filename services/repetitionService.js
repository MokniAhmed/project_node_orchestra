const factory = require("./handlersFactory");

const Repetition = require("../models/repetitionModel");

// test
exports.createRepetition = factory.createOne(Repetition);
exports.updateRepetition = factory.updateOne(Repetition);
exports.deleteRepetition = factory.deleteOne(Repetition);
exports.getAllRepetition = factory.getAll(Repetition);
exports.getRepeitionById = factory.getOne(Repetition);
