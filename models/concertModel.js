const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema(
  {
    season: { type: mongoose.Schema.ObjectId, ref: "Season" },
    name: { type: String, required: [true, "concert need a Name."] },
    location: String,
    day: Date,
    description: String,
    music: [{ type: mongoose.Schema.ObjectId, ref: "Musical" }],
    list_final: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    list_candidate: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);
concertSchema.pre(/^find/, function (next) {
  if (!this.getOptions().skipConcertPopulation) {
    this.populate({
      path: "list_final",
      select: " firstName lastName phone group_pupitre",
    });
    this.populate({
      path: "list_candidate",
      select: " firstName lastName phone group_pupitre",
    });
  }
  next();
});
const Concert = mongoose.model("Concert", concertSchema);

module.exports = Concert;
