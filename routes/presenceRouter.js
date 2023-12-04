const express = require("express");
const { markPrsence } = require("../services/presenceService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/qrcode/:id", protect, allowedTo("chorist"), markPrsence);

module.exports = router;
