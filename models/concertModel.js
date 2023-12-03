const mongoose = require("mongoose");

const concertSchema = new mongoose.Schema({
  season: { type: mongoose.Schema.ObjectId, ref: "Season" },
  name: { type: String, required: [true, "concert needs a Name."] },
  location: String,
  description: String,
  music: [{ type: mongoose.Schema.ObjectId, ref: "Musical" }],
  //list_final: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
});

const Concert = mongoose.model("Concert", concertSchema); // Corrected usage

module.exports = Concert;
