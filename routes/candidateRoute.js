const express = require("express");

const candidateService = require("../services/candidateService");

const {
  createCondidateValidator,
  deleteCondidateValidator,
} = require("../utils/validators/candidateValidator");

const {
  CreateCondidateNotValide,
  ValidateCondidate,
  acceptetionCandidateEmails,
  createNewCandidate,
  getOneCandidate,
  updateInfosAuditionForCondidate,
  deleteCondidateById,
  responseCondidateForAcceptation,
} = require("../services/candidateService");

const router = express.Router();
const { protect, allowedTo } = require('../middlewares/authMiddleware');
const admin = [protect, allowedTo('admin')];

/**
 * @swagger
 * /api/v1/candidate/all:
 *   get:
 *     summary: Get all Candidates
 *     description: Retrieve a list of all candidates.
 *     tags:
 *       - Candidate
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 */
router.get("/all", ...admin, candidateService.getAllCandidates);
/**
 * @swagger
 * /api/v1/candidate:
 *   post:
 *     summary: Create a Candidate
 *     description: Create a new candidate with the provided information.
 *     tags:
 *       - Candidate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               gender:
 *                 type: string
 *               phone:
 *                 type: string
 *               nationality:
 *                 type: string
 *               cin:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *               height:
 *                 type: number
 *               audition_id:
 *                 type: string
 *               professional_situation:
 *                 type: string
 *               availability:
 *                 type: string
 *                 format: date
 *               musical_knowledge:
 *                 type: array
 *                 items:
 *                   type: string
 *               other_choir_activity:
 *                 type: boolean
 *           example:
 *             firstName: "tester"
 *             lastName: "tester"
 *             email: "tester@gmail.com"
 *             address: "mourouj"
 *             gender: "homme"
 *             phone: "55252525"
 *             nationality: "tunisis"
 *             cin: "25252525"
 *             birthday: "2000/10/20"
 *             height: 1.25
 *             audition_id: "656cc25b1fcbeea90f47dc9f"
 *             professional_situation: "tunisis"
 *             availability: "10-02-2000"
 *             musical_knowledge: ["tunisis"]
 *             other_choir_activity: true
 *     responses:
 *       201:
 *         $ref: '#/components/responses/201'
 *       400:
 *         $ref: '#/components/responses/400'
 */
router.post("/", createCondidateValidator, CreateCondidateNotValide);
//for test
router.post("/new", ...admin, createNewCandidate);
router.get("/:id", ...admin, getOneCandidate);
/**
 * @swagger
 * /api/v1/candidate/{token}:
 *   put:
 *     summary: Validate Candidate
 *     description: Update the validation status for a candidate using the provided token.
 *     tags:
 *       - Candidate
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Token associated with the candidate validation request
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.put("/:token", ValidateCondidate);
/**
 * @swagger
 * /api/v1/candidate/infos/{id}:
 *   put:
 *     summary: Update Candidate Audition Information
 *     description: Update audition information for a specific candidate by their ID.
 *     tags:
 *       - Candidate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the candidate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.put("/infos/:id", ...admin, updateInfosAuditionForCondidate);
/**
 * @swagger
 * /api/v1/candidate/{id}:
 *   delete:
 *     summary: Delete Candidate by ID
 *     description: Delete a candidate by their ID.
 *     tags:
 *       - Candidate
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the candidate to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.delete("/:id", ...admin, deleteCondidateValidator, deleteCondidateById);
/**
 * @swagger
 * /api/v1/candidate:
 *   get:
 *     summary: Get Accepted Candidates' Emails
 *     description: Retrieve a list of emails for accepted candidates.
 *     tags:
 *       - Candidate
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               data: ["email1@example.com", "email2@example.com"]
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 */
router.get("/", ...admin, acceptetionCandidateEmails);
/**
 * @swagger
 * /api/v1/candidate/res/{token}:
 *   put:
 *     summary: Respond to Candidate Acceptance
 *     description: Update the acceptance response for a candidate using the provided token.
 *     tags:
 *       - Candidate
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: Token associated with the candidate acceptance request
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/BadRequestResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundResponse'
 */
router.put("/res/:token", responseCondidateForAcceptation);

module.exports = router;
