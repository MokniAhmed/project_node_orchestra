const express = require("express");
const {
  getHistoryByUser,
  addPrsenceAutomatiqly,
  getStatistique,
  etatAbsentStat,
  getAbsList,
  nominatedorabsentchoriste,
  profilDetail,
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
router.get("/stats-etat-rep", etatAbsentStat);
router.get("/listabs", getAbsList);
router.post("/nomination/:id", nominatedorabsentchoriste);
router.post("/profil/:id", profilDetail);

module.exports = router;
