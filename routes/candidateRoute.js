const express = require("express");

const candidateService = require("../services/candidateService");





const {
  createCondidateValidator,
} = require("../utils/validators/candidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,
} = require("../services/candidateService");

const router = express.Router();
router.get("/all", candidateService.getAllCandidates);
router.post("/", createCondidateValidator, CreateCondidateNotValide);
router.put("/:token", ValidateCondidate);


module.exports = router;
