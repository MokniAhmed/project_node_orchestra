const express = require("express");

const seasonService = require("../services/seasonService");

const {
  createNewSeasonValidator,
} = require("../utils/validators/seasonValidator");

const router = express.Router();

router.post("/", createNewSeasonValidator, seasonService.CreateSeason);

module.exports = router;
