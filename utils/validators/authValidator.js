const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
// const User = require("../../models/userModel");

exports.loginValidator = [
  check("email").notEmpty().withMessage("Email required"),
  // .isEmail()
  // .withMessage('Invalid email address'),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),

  validatorMiddleware,
];
