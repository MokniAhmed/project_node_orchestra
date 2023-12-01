const mongoose = require("mongoose");

exports.PUPITREGROUP = ["first", "second", "third", "forth"];
const musicalSchema = new mongoose.Schema({
  title: { type: String, required: [true, "muscial work need a Title."] },
  composator: [
    {
      type: String,
      required: [true, "muscial work need a compsator."],
    },
  ],
  genre: { type: String, required: [true, "muscial work need a genre."] },
  lyrics: { type: String },
  arrangeurs: [
    {
      type: String,
      required: [true, "muscial work need a arrangeurs."],
    },
  ],
  date_composition: {
    type: Date,
    required: [true, "muscial work need a Date of composition."],
  },
  part_choeur: Boolean,
  presence_Choeur: Boolean,
  pupitre: [
    {
      type: String,
      enum: ["first", "second", "third", "forth"],
      required: [true, "muscial work need a pupitre"],
    },
  ],
});

const Musical = mongoose.model("Musical", musicalSchema);
module.exports = Musical;
