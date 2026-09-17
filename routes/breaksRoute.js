const express = require("express");

const breakService = require("../services/breaksService");

const breakValidator = require("../utils/validators/breaksValidator");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const { breakOwnerOrAdmin, pendingBreak } = require('../middlewares/ownershipMiddleware');
router
  .route("/")
  /**
   * @swagger
   * /api/v1/break:
   *   post:
   *     summary: Get all Audition
   *     description: Retrieve a list of all Audition.
   *     tags:
   *       - Breaks
   *     responses:
   *       200:
   *         description: Successful response
   */
  .post(
    authMiddleware.protect,
    breakValidator.createBreakValidator,
    breakService.createBreak
  )
  /**
   * @swagger
   * /api/v1/break:
   *   get:
   *     summary: Get all Audition
   *     description: Retrieve a list of all Audition.
   *     tags:
   *       - Breaks
   *     responses:
   *       200:
   *         description: Successful response
   */
  .get(authMiddleware.protect, authMiddleware.allowedTo('admin'), breakService.getBreaks);

router
  .route("/:id")
  .put(authMiddleware.protect, breakOwnerOrAdmin, pendingBreak, breakValidator.updateBreakValidator, breakService.updateInfoBreakById)
  .get(authMiddleware.protect, breakOwnerOrAdmin, breakService.getBreakById)
  .delete(authMiddleware.protect, authMiddleware.allowedTo('admin'), breakValidator.deleteBreakValidator, breakService.deleteBreakById);
/**
 * @swagger
 * /api/v1/break/status/{id}:
 *   put:
 *     summary: Update Break Status by ID
 *     description: Update the status of a break by its ID.
 *     tags:
 *       - Breaks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the break
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 description: The new status of the break
 *                 enum:
 *                   - "pending"
 *                   - "approved"
 *                   - "rejected"
 *     responses:
 *       200:
 *         description: Successful response
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/status/:id",
  authMiddleware.protect,
  authMiddleware.allowedTo('admin'),
  breakService.updateStatusBreakById
);

module.exports = router;
