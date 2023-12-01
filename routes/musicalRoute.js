const express = require("express");

const musicalService = require("../services/musicalService");

const {
  createNewMusicalValidator,
  deleteMusicalValidator,
  updateMusicalValidator,
  getMusicalByIdValidator,
} = require("../utils/validators/musicalValidator");

const router = express.Router();
router
  .route("/")
  .post(createNewMusicalValidator, musicalService.createMusical)
  .get(musicalService.getAllMusical);

router
  .route("/:id")
  .put(updateMusicalValidator, musicalService.updateMusical)
  .get(getMusicalByIdValidator, musicalService.getMusicalById)
  .delete(deleteMusicalValidator, musicalService.deleteMusicalById);

module.exports = router;
