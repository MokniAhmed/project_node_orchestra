const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createBreakValidator = [
  check("reason")
    .notEmpty()
    .withMessage("reason required")
    .isLength({ min: 3 })
    .withMessage("Too short reason "),
  check("start_date")
    .notEmpty()
    .withMessage("start_date required")
    .isDate()
    .withMessage("type date required")
    .custom((val, { req }) => {
      //verify startSeason=<endSeason
      const startDate = new Date(val).getTime();
      const endDate = new Date(req.body.end_date).getTime();

      if (startDate > endDate) {
        throw new Error("startDate > endDate");
      }
      return true;
    }),
  check("start_date")
    .notEmpty()
    .withMessage("start_date required")
    .isDate()
    .withMessage("type date required"),
  validatorMiddleware,
];
exports.deleteBreakValidator = [
  check("id").isMongoId().withMessage("Invalid Break Id format"),
  validatorMiddleware,
];
exports.updateBreakValidator = [
  check("id").isMongoId().withMessage("Invalid Break Id format"),
  validatorMiddleware,
];
