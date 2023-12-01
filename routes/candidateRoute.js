const express = require("express");

const candidateService = require("../services/candidateService");

const {
  createCondidateValidator,
  deleteCondidateValidator,
} = require("../utils/validators/candidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,

  createNewCandidate,
  getOneCandidate,

  updateInfosAuditionForCondidate,
  deleteCondidateById,

} = require("../services/candidateService");

const router = express.Router();
router.get("/all", candidateService.getAllCandidates);
router.post("/", createCondidateValidator, CreateCondidateNotValide);
//for test
router.post("/new", createNewCandidate);
router.get("/:id", getOneCandidate);
router.put("/:token", ValidateCondidate);
router.put("/infos/:id", updateInfosAuditionForCondidate);
router.delete("/:id", deleteCondidateValidator, deleteCondidateById);

module.exports = router;
