const express = require("express");

const seasonService = require("../services/seasonService");

const {
  createNewSeasonValidator,
} = require("../utils/validators/seasonValidator");

const router = express.Router();
/**
 * @swagger
 * /api/v1/season:
 *   post:
 *     summary: Create New Season
 *     description: Create a new season.
 *     tags:
 *       - Season
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the season
 *               endSeason:
 *                 type: string
 *                 format: date
 *                 description: End date of the season (YYYY/MM/DD)
 *               startSeason:
 *                 type: string
 *                 format: date
 *                 description: Start date of the season (YYYY/MM/DD)
 *               max_absence:
 *                 type: integer
 *                 description: Maximum allowed absence for the season
 *             required:
 *               - name
 *               - endSeason
 *               - startSeason
 *               - max_absence
 *     responses:
 *       201:
 *         $ref: '#/components/responses/201'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post("/", createNewSeasonValidator, seasonService.CreateSeason);

module.exports = router;
