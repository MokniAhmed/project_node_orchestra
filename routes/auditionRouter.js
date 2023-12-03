const express = require("express");
const {
  createAudition,
  AllAudition,
  getPlanningByAuditId,
} = require("../services/auditionService");

const router = express.Router();

router.post("/:seasonId", createAudition);
router.get("/", AllAudition);
router.get("/:id", getPlanningByAuditId);
module.exports = router;
