const express = require("express");
const {
  createAudition,
  AllAudition,
  getPlanningByAuditId,
  deleteauditionId,
} = require("../services/auditionService");

const router = express.Router();
const { protect, allowedTo } = require('../middlewares/authMiddleware');
const admin = [protect, allowedTo('admin')];
/**
 * @swagger
 * /api/v1/audition/{seasonId}:
 *   post:
 *     summary: Create Audition
 *     description: Create a new audition for a specific season.
 *     tags:
 *       - Audition
 *     parameters:
 *       - in: path
 *         name: seasonId
 *         required: true
 *         description: ID of the season for which the audition is created
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audition_starting_date:
 *                 type: string
 *                 format: date
 *               season:
 *                 type: string
 *                 description: ID of the season
 *               starting_date:
 *                 type: string
 *                 format: date
 *               ending_date:
 *                 type: string
 *                 format: date
 *               nb_candidate_day:
 *                 type: integer
 *           example:
 *             audition_starting_date: "2023-12-04"
 *             season: "65686f6181df7f856e401496"
 *             starting_date: "2023-12-01"
 *             ending_date: "2023-12-03"
 *             nb_candidate_day: 3
 */
router.post("/:seasonId", ...admin, createAudition);
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
/**
 * @swagger
 * /api/v1/audition/{id}:
 *   get:
 *     summary: Get Planning by Audit ID
 *     description: Retrieve planning data for a specific audit ID.
 *     tags:
 *       - Audition
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the audit
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - starting_date: "2023-12-04T08:00:00.000Z"
 *                   duration: 30
 *                   order: 1
 *                   candidate:
 *                     _id: "656cc2901fcbeea90f47dca2"
 *                     firstName: "tester"
 *                     email: "tester@gmail.com"
 *                   _id: "656cc2911fcbeea90f47dca5"
 */
router.get("/:id", ...admin, getPlanningByAuditId);
router.delete("/:id", ...admin, deleteauditionId);

module.exports = router;
