const express = require("express");

const candidateService = require("../services/candidateService");

const {
  createCondidateValidator,
} = require("../utils/validators/candidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,
  updateInfosAuditionForCondidate,
} = require("../services/candidateService");

const router = express.Router();
router.get("/all", candidateService.getAllCandidates);
router.post("/", createCondidateValidator, CreateCondidateNotValide);
router.put("/:token", ValidateCondidate);
router.put("/infos/:id", updateInfosAuditionForCondidate);

module.exports = router;
