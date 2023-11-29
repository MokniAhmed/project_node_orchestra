const express = require("express");
const {
  createCondidateValidator,
} = require("../utils/validators/condidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,
} = require("../services/condidateService");

const router = express.Router();

router.post("/", createCondidateValidator, CreateCondidateNotValide);
router.put("/:token", ValidateCondidate);

module.exports = router;
