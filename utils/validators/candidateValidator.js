const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Condidate = require("../../models/candidateModel");

exports.createCondidateValidator = [
  check("lastName")
    .notEmpty()
    .withMessage("lastName required")
    .isLength({ min: 3 })
    .withMessage("Too short lastName "),
  check("firstName")
    .notEmpty()
    .withMessage("firstName required")
    .isLength({ min: 3 })
    .withMessage("Too short firstName "),

  check("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),
  /*    .custom((val) =>
      Condidate.findOne({ email: val }).then((condidate) => {
        if (condidate) {
          return Promise.reject(new Error("E-mail already in condidate"));
        }
        return true;
      })
    ), */
  check("birthday")
    .notEmpty()
    .withMessage("birthday required")
    .isDate()
    .withMessage("Type is Date"),

  check("address")
    .notEmpty()
    .withMessage("address required")
    .isLength({ min: 3 })
    .withMessage("Too short address "),

  check("height").notEmpty().withMessage("height required"),
  check("gender").notEmpty().withMessage("gender required"),
  check("nationality").notEmpty().withMessage("nationality required"),
  check("cin").notEmpty().withMessage("cin required"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN "),

  validatorMiddleware,
];
exports.deleteCondidateValidator = [
  check("id").isMongoId().withMessage("Invalid Condidate Id format"),
  validatorMiddleware,
];
