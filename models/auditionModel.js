const mongoose = require("mongoose");

const auditionSchema = new mongoose.Schema(
  {
    season: {
      type: mongoose.Schema.ObjectId,
      ref: "Season",
      required: [true, "Audition must belong to a Season."],
    },
    starting_date: {
      type: Date,
      required: [true, "must give a starting Date."],
    },
    ending_date: { type: Date, required: [true, "must give a ending Date."] },
    planning: [
      {
        starting_date: Date,
        duration: { type: Number, default: 30 },
        order: Number,
        candidate: { type: mongoose.Schema.ObjectId },
      },
    ],
    audition_starting_date: {
      type: Date,
      required: [true, "must give a audition  Date."],
    },
    nb_candidate_day: {
      type: Number,
      required: [true, "provide number of candidate for each day."],
    },
    total_condidate: Number,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
  {
    timestamps: true,
  }
);
// feha eroor model
/* auditionSchema.pre(/^find/, function (next) {
  this.populate("season");

  next();
}); */

const Audition = mongoose.model("Audition", auditionSchema);

module.exports = Audition;
