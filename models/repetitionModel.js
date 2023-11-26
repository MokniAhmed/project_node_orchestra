const mongoose = require("mongoose");

const repetitionSchema = new mongoose.Schema({
  concert: { type: mongoose.Schema.ObjectId, ref: "Concert" },
  location_repetition: {
    type: String,
    required: [true, "need place of a repetition."],
  },
  start_rep: { type: Date },
  end_rep: { type: Date },
  day: Date,
  group_participant: [
    { type: String, enum: ["first", "second", "third", "fourth"] },
  ],
  list_presence: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
});

const Repetition = mongoose.Model("Repetition", repetitionSchema);
module.exports = Repetition;
