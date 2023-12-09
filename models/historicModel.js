const mongoose = require("mongoose");

const historicSchema = new mongoose.Schema(
  {
    user_sender: { type: mongoose.Schema.ObjectId, ref: "User" },
    pupitre: { type: String, enum: ["first", "second", "third", "fourth"] },
    reason: { type: String },
    event: { type: String, enum: ["rep", "concert"] },
    rep: { type: mongoose.Schema.ObjectId, ref: "Repetition" },
    concert: { type: mongoose.Schema.ObjectId, ref: "Concert" },
    date: Date,
    status: {
      type: String,
      enum: ["absent", "present", "absent_demanded"],
      default: "absent",
    },
    music: [{ type: mongoose.Schema.ObjectId, ref: "Musical" }],
  },
  { timestamps: true }
);

const Historic = mongoose.model("Historic", historicSchema);
module.exports = Historic;
