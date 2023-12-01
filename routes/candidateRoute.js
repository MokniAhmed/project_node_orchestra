const express = require("express");

const candidateService = require("../services/candidateService");

const {
  createCondidateValidator,
} = require("../utils/validators/candidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,
  createNewCandidate,
  getOneCandidate,
} = require("../services/candidateService");

const router = express.Router();
router.get("/all", candidateService.getAllCandidates);
router.post("/", createCondidateValidator, CreateCondidateNotValide);
//for test
router.post("/new", createNewCandidate);
router.get("/:id", getOneCandidate);
router.put("/:token", ValidateCondidate);

module.exports = router;
