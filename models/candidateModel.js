const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: [true, "candidate need first name"] },
  lastName: { type: String, required: [true, "candidate need lastName"] },
  birthday: { type: Date, required: [true, "must be provided a Date."] },
  address: { type: String, required: [true, "address need to be provided"] }, //maybe remake as geopoint
  height: { type: Number, required: [true, "a height must be  provided"] },
  gender: { type: String, required: [true, "gender need to be provided"] },
  phone: String,
  nationality: {
    type: String,
    required: [true, "nationality need to be provided"],
  },
  cin: { type: Number },
  professional_situation: { type: String },
  availability: { type: Date },
  musical_knowledge: [String],
  other_choir_activity: { type: Boolean },
  remark: { type: String },
  range: { type: String },
  appreciation: { type: String },
  piece_of_music: { type: String },
  nb_ordre: { type: Number },
  validate_mail: { type: Boolean },
  token_validate: String,
});
const Candidate = mongoose.Model("Candidate", candidateSchema);
module.exports = Candidate;
