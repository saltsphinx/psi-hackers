const { body } = require("express-validator");

module.exports = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Name must be included.")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name must only contain alphabetical characters.")
    .isLength({ min: 3 })
    .withMessage("Full name must be longer than 3 characters."),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username must be included.")
    .isLength({ min: 6, max: 24 })
    .withMessage("Username must be between 6 to 24 characters."),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password must be included.")
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8 to 32 characters."),
  body("confirm_password")
    .custom((value, { req }) => {
      return value == req.body.password;
    })
    .withMessage("Passwords must match."),
];
