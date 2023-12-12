const express = require("express");
const { getHistoryByUser } = require("../services/historicService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/my-histroy", protect, getHistoryByUser);
router.get("/chorist-history");

module.exports = router;
