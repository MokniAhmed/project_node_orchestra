const express = require("express");
const {
  markPrsence,
  addPrsenceManualy,
  demandeAbsent,
} = require("../services/presenceService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();
router.put("/qrcode", protect, markPrsence);
router.put("/add-manualy/:id", addPrsenceManualy);
router.put("/demandeAbsent", protect, demandeAbsent);

module.exports = router;
