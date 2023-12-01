const mongoose = require("mongoose");

const absentSchema = new mongoose.Schema({
  user_sender: { type: mongoose.Schema.ObjectId, ref: "User" },
  responsible: { type: mongoose.Schema.ObjectId, ref: "User" },
  reason: { type: String, required: [true, "provide a reason ."] },
  event: { type: String, enum: ["rep", "concert"] },
  rep: { type: mongoose.Schema.ObjectId, ref: "Repetition" },
  concert: { type: mongoose.Schema.ObjectId, ref: "Concert" },
  date: Date,
  status_request: {
    type: String,
    enum: ["rejected,accepted,pending"],
    default: "pending",
  },
});

const Absent = mongoose.model("Absent", absentSchema);
module.exports = Absent;
