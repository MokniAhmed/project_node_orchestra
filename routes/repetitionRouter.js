const express = require("express");
const {
  createRepetition,
  getAllRepetition,
  getRepeitionById,
  deleteRepetition,
  updateRepetition,
} = require("../services/repetitionService");

const router = express.Router();

router.route("/").get(getAllRepetition).post(createRepetition);
router
  .route("/:id")
  .get(getRepeitionById)
  .patch(updateRepetition)
  .delete(deleteRepetition);

module.exports = router;
