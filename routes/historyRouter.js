const express = require("express");
const {
  getHistoryByUser,
  addPrsenceAutomatiqly,
  getStatistique,
} = require("../services/historicService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get(
  "/my-histroy/:id",
  protect,
  allowedTo("chorist", "admin"),
  getHistoryByUser
);
router.get("/state-history", getStatistique);
router.post("/add-present-auto", addPrsenceAutomatiqly);

module.exports = router;
