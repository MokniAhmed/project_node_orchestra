const express = require("express");

const {
  createConcert,
  getAllConcerts,
  getConcertById,
  deleteConcertById,
  updateConcertById,
  checkDisponiblilte,
  getFinalList,
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
router.post("/confirm/:id", checkDisponiblilte);
router.get("/final-list/:id", getFinalList);
module.exports = router;
