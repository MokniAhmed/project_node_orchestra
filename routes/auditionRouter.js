const express = require("express");
const {
  createAudition,
  AllAudition,
  getPlanningByAuditId,
} = require("../services/auditionService");

const router = express.Router();

router.post("/:seasonId", createAudition);
/**
 * @swagger
 * /api/v1/audition:
 *   get:
 *     summary: Get all Audition
 *     description: Retrieve a list of all Audition.
 *     tags:
 *       - Audition
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 */
router.get("/", AllAudition);
router.get("/:id", getPlanningByAuditId);
module.exports = router;
