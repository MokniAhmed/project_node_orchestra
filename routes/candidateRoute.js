const express = require("express");
const candidateService = require("../services/candidateService");

const router = express.Router();

router.get("/all", candidateService.getAllCandidates);

module.exports = router;
