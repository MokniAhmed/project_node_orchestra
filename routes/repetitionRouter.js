const express = require("express");
const {
  createRepetition,
  getAllRepetition,
  getRepeitionById,
  deleteRepetition,
  updateRepetition,
  getQrCode,
} = require("../services/repetitionService");

const router = express.Router();

router.route("/").get(getAllRepetition).post(createRepetition);
router
  .route("/:id")
  .get(getRepeitionById)
  .patch(updateRepetition)
  .delete(deleteRepetition);
router.get("/qrCode/:id", getQrCode);
module.exports = router;
