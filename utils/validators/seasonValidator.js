const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createNewSeasonValidator = [
  check("name")
    .notEmpty()
    .withMessage("name required")
    .isLength({ min: 2 })
    .withMessage("Too short name "),
  check("startSeason")
    .notEmpty()
    .withMessage("startSeason required")
    .isDate()
    .withMessage("type date required")
    .custom((val, { req }) => {
      //verify startSeason<endSeason
      const startSeason = new Date(val).getTime();
      const endSeason = new Date(req.body.endSeason).getTime();
      if (startSeason > endSeason) {
        throw new Error("startSeason > endSeason");
      }
      return true;
    }),

  check("endSeason")
    .notEmpty()
    .withMessage("startSeason required")
    .isDate()
    .withMessage("type date required"),
  check("max_absence").isInt().withMessage("type integer required "),

  validatorMiddleware,
];
