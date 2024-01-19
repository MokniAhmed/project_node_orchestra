const express = require("express");
const { loginValidator } = require("../utils/validators/authValidator");

const {
  login,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
} = require("../services/authService");

const router = express.Router();
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticate a user and generate a JWT token for login.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *               password:
 *                 type: string
 *                 description: User's password
 *           example:
 *             email: "grady_cassin@hotmail.com"
 *             password: "chorist123"
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             example:
 *               token: "your_generated_jwt_token"
 *       400:
 *         description: Bad request. Invalid email or password.
 *         content:
 *           application/json:
 *             example:
 *               error: "Invalid email or password"
 */
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgotPassword);
router.post("/verifyResetCode", verifyPassResetCode);
router.put("/resetPassword", resetPassword);

module.exports = router;
