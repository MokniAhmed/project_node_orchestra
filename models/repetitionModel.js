const mongoose = require("mongoose");

const repetitionSchema = new mongoose.Schema(
  {
    concert: { type: mongoose.Schema.ObjectId, ref: "Concert" },
    location_repetition: {
      type: String,
      required: [true, "need place of a repetition."],
    },
    start_rep: { type: Date },
    end_rep: { type: Date },
    day: Date,
    group_participant: [
      {
        name: {
          type: String,
          enum: ["first", "second", "third", "fourth"],
        },
        percentage: {
          type: Number,
          min: 0,
          max: 100,
          default: 100,
        },
      },
    ],
    list_invited: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    music: [{ type: mongoose.Schema.ObjectId, ref: "Musical" }],
  },
  { timestamps: true }
);

const Repetition = mongoose.model("Repetition", repetitionSchema);
module.exports = Repetition;
