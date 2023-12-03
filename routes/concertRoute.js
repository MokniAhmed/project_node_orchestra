const express = require("express");

const {
  createConcert,
  getAllConcerts,
  getConcertById,
  deleteConcertById,
  updateConcertById,
} = require("../services/concertService");
const {
  createConcertValidator,
} = require("../utils/validators/concertValidator");

const router = express.Router();
router.post("/", createConcertValidator, createConcert);
router.get("/", getAllConcerts);
router.get("/:id", getConcertById);

router.delete("/:id", deleteConcertById);
router.put("/:id", updateConcertById);

module.exports = router;
