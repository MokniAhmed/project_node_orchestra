const express = require("express");

const {
  createConcert,
  getAllConcerts,
  getConcertById,
  deleteConcertById,
  updateConcertById,
  checkDisponiblilte,
  getFinalList,
  getPlacement,
  confirmAllToConcert,
} = require("../services/concertService");
const {
  createConcertValidator,
} = require("../utils/validators/concertValidator");

const { getQrCode } = require("../services/repetitionService");

const router = express.Router();
router.post("/", createConcertValidator, createConcert);
router.get("/", getAllConcerts);
router.get("/:id", getConcertById);

router.delete("/:id", deleteConcertById);
router.put("/:id", updateConcertById);
router.post("/confirm/:id", checkDisponiblilte);
router.get("/final-list/:id", getFinalList);
router.get("/get-qrcode/:id", getQrCode);
router.get("/placement/:id", getPlacement);
router.get("/confirm-all/:id", confirmAllToConcert);
module.exports = router;
