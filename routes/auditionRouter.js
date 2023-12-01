const express = require("express");
const { createAudition, AllAudition } = require("../services/auditionService");

const router = express.Router();

router.post("/:seasonId", createAudition);
router.get("/", AllAudition);
module.exports = router;
