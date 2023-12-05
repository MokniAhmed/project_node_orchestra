const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema(
  {
    season: { type: mongoose.Schema.ObjectId, ref: "Season" },
    name: { type: String, required: [true, "concert need a Name."] },
    location: String,
    date: Date,
    description: String,
    music: [{ type: mongoose.Schema.ObjectId, ref: "Musical" }],
    list_final: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    list_candidate: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Concert = mongoose.model("Concert", concertSchema);

module.exports = Concert;
