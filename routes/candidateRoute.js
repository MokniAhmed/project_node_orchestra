const express = require("express");
const {
  createCondidateValidator,
} = require("../utils/validators/candidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,
} = require("../services/candidateService");

const router = express.Router();

router.post("/", createCondidateValidator, CreateCondidateNotValide);
router.put("/:token", ValidateCondidate);

module.exports = router;
