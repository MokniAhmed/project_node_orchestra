const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Concert = require("../../models/concertModel");

exports.createConcertValidator = [
  check("season")
    .notEmpty()
    .withMessage("season required")
    .isLength({ min: 3 })
    .withMessage("Too short season "),
  check("name")
    .notEmpty()
    .withMessage("name required")
    .isLength({ min: 3 })
    .withMessage("Too short name ")
    .custom((val, { req }) =>
      Concert.findOne({ name: val, season: req.body.season }).then(
        (Concert) => {
          if (Concert) {
            return Promise.reject(new Error("concert exists !"));
          }
        }
      )
    ),

  check("location").notEmpty().withMessage("location required"),
  check("description").notEmpty().withMessage("description required"),

  validatorMiddleware,
];
exports.deleteConcertValidator = [
  check("id").isMongoId().withMessage("Invalid Concert Id format"),
  validatorMiddleware,
];
