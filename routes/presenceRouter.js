const express = require("express");
const {
  markPrsence,
  addPrsenceManualy,
  demandeAbsent,
  getPorcentagePresenceInSeasonForAnyPupitre,
} = require("../services/presenceService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();
router.put("/qrcode", protect, markPrsence);
router.put("/add-manualy/:id", addPrsenceManualy);
router.put("/demandeAbsent", protect, demandeAbsent);
router.get(
  "/nbr_presence_in_season_for_any_pupitre/:id",
  getPorcentagePresenceInSeasonForAnyPupitre
);

module.exports = router;
