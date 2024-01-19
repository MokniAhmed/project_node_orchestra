const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "must provide a name "] },

    startSeason: {
      type: Date,
      required: [true, "must provide a starting date "],
    },
    endSeason: { type: Date, required: [true, "must provide a ending date "] },
    state_season: { type: String, enum: ["archived", "new"], default: "new" },
    nomination: { type: String, default: 8 },
    nominatedMembers: [
      {
        memberId: mongoose.Types.ObjectId,
        nom: String,
      },
    ],
    max_absence: { type: Number, default: 365 },
    absentMembers: [
      {
        memberId: mongoose.Types.ObjectId,
        nom: String,
      },
    ],
  },
  { timestamps: true }
);

const Season = mongoose.model("Season", seasonSchema);
module.exports = Season;
