const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "candidate need first name"] },
    lastName: { type: String, required: [true, "candidate need lastName"] },
    email: {
      type: String,
      trim: true,
      required: [true, "candidate need email"],
    },
    birthday: { type: Date, required: [true, "must be provided a Date."] },
    address: { type: String, required: [true, "address need to be provided"] }, //maybe remake as geopoint
    height: { type: Number, required: [true, "a height must be  provided"] },
    gender: { type: String, required: [true, "gender need to be provided"] },
    phone: String,
    nationality: {
      type: String,
      required: [true, "nationality need to be provided"],
    },
    audition_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Audition",
      required: [true, "condidate must belong to a Audition."],
    },
    cin: { type: String, required: [true, "cin need to be provided"] },
    professional_situation: { type: String },
    availability: { type: Date },
    musical_knowledge: [String],
    other_choir_activity: { type: Boolean },
    remark: { type: String },
    range: { type: String },
    appreciation: { type: String },
    piece_of_music: { type: String },
    group_pupitre: {
      type: String,
      enum: ["first", "second", "third", "fourth"],
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "accepted_confimed", "cancelled"],
    },
    nb_ordre: { type: Number },
    validate_mail: { type: Boolean, default: false },
    token_validate: String,
  },

  {
    timestamps: true,
  }
);

// candidateSchema.pre(/^find/, function (next) {
//   this.populate("audition_id");
//   next();
// });


const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
