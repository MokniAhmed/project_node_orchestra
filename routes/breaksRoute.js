const express = require("express");

const breakService = require("../services/breaksService");

const breakValidator = require("../utils/validators/breaksValidator");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
router
  .route("/")
  .post(
    breakValidator.createBreakValidator,
    authMiddleware.protect,
    breakService.createBreak
  )
  .get(breakService.getBreaks);

router
  .route("/:id")
  .put(breakValidator.updateBreakValidator, breakService.updateInfoBreakById)
  .get(breakService.getBreakById)
  .delete(breakValidator.deleteBreakValidator, breakService.deleteBreakById);

router.put(
  "/status/:id",
  authMiddleware.protect,
  breakService.updateStatusBreakById
);

module.exports = router;
