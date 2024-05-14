const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

exports.createNewMusicalValidator = [
  check("title")
    .notEmpty()
    .withMessage("title required")
    .isLength({ min: 2 })
    .withMessage("Too short title "),
  check("composator").notEmpty().withMessage("composator required"),

  check("genre").notEmpty().withMessage("genre required"),
  check("arrangeurs").notEmpty().withMessage("arrangeurs required"),
  check("lyrics").notEmpty().withMessage("lyrics required"),
  check("date_composition")
    .notEmpty()
    .withMessage("date_composition required")
    .isDate()
    .withMessage("type date required"),
  check("part_choeur")
    .notEmpty()
    .withMessage("part_choeur required")
    .isBoolean()
    .withMessage("type boolean required"),
  check("presence_Choeur")
    .notEmpty()
    .withMessage("presence_Choeur required")
    .isBoolean()
    .withMessage("type boolean required"),
  check("pupitre")
    .notEmpty()
    .withMessage("pupitre required")
    .isArray({ min: 1, max: 4 })
    .withMessage("length in [1..4] ")
    .custom((val) => {
      const puitreGroup = ["first", "second", "third", "forth"];
      //create newArr = puitreGroup union val
      const newArr = [...new Set([...val, ...puitreGroup])];

      if (newArr.length > 4) {
        return Promise.reject(
          new Error(
            "groupe puputre invalid ('first', 'second', 'third', 'forth')"
          )
        );
      }
      return true;
    }),

  validatorMiddleware,
];

exports.deleteMusicalValidator = [
  check("id").isMongoId().withMessage("Invalid Musical Id format"),
  validatorMiddleware,
];
exports.updateMusicalValidator = [
  check("id").isMongoId().withMessage("Invalid Musical Id format"),
  validatorMiddleware,
];

exports.getMusicalByIdValidator = [
  check("id").isMongoId().withMessage("Invalid Musical Id format"),
  validatorMiddleware,
];
