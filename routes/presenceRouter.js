const express = require("express");
const {
  markPrsence,
  addPrsenceManualy,
} = require("../services/presenceService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/qrcode/:id", protect, allowedTo("chorist"), markPrsence);
router.post("/add-manualy/:id", addPrsenceManualy);

module.exports = router;
