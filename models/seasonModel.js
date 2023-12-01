const mongoose = require("mongoose");

const seasonSchema = new mongoose.Schema({
  name: { type: String, required: [true, "must provide a name "] },
  startSeason: {
    type: Date,
    required: [true, "must provide a starting date "],
  },
  endSeason: { type: Date, required: [true, "must provide a ending date "] },
  state_season: { type: String, enum: ["archived", "new"], default: "new" },
  max_absence: { type: Number, default: 365 },
});

const Season = mongoose.model("Season", seasonSchema);
module.exports = Season;
