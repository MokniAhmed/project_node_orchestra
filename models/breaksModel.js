const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema({
  user_sender: { type: mongoose.Schema.ObjectId, ref: "User" },
  responsible: { type: mongoose.Schema.ObjectId, ref: "User" },
  reason: { type: String, required: [true, "provide a reason ."] },
  start_date: { type: Date, required: [true, "provide a starting date."] },
  end_date: { type: Date, required: [true, "provide a ending date."] },
  status_request: {
    type: String,
    enum: ["rejected,accepted,pending"],
    default: "pending",
  },
});

const Break = mongoose.model("Break", breakSchema);
module.exports = Break;
