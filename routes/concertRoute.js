const express = require("express");

const {
  createConcert,
  getAllConcerts,
  getConcertById,
  deleteConcertById,
  updateConcertById,
  checkDisponiblilte,
  getFinalList,
  getPlacement,
  confirmAllToConcert,
  getConcertByIdAll,
} = require("../services/concertService");
const {
  createConcertValidator,
} = require("../utils/validators/concertValidator");

const { getQrCode } = require("../services/repetitionService");

const router = express.Router();
const { protect, allowedTo } = require('../middlewares/authMiddleware');
const admin = [protect, allowedTo('admin')];
/**
 * @swagger
 * /api/v1/concert:
 *   post:
 *     summary: Create a Concert
 *     description: Create a new concert with the provided information.
 *     tags:
 *       - Concert
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               season:
 *                 type: string
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               day:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               music:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - season
 *               - name
 *               - location
 *               - day
 *               - description
 *               - music
 *           example:
 *             season: "6569be475bbb730a710bca5b"
 *             name: "summer fesitval benzart"
 *             location: "benzart"
 *             day: "2023-12-05T09:59:00"
 *             description: "nouba is good"
 *             music: [
 *               "657c4b6fb98452067feb77fc",
 *               "657c4b6fb98452067feb77fd",
 *               "657c4b6fb98452067feb77ff",
 *               "657c4b6fb98452067feb7801",
 *               "657c4b6fb98452067feb7802"
 *             ]
 *     responses:
 *       201:
 *         $ref: '#/components/responses/201'
 *       400:
 *         $ref: '#/components/responses/400'
 */
router.post("/", ...admin, createConcertValidator, createConcert);
/**
 * @swagger
 * /api/v1/concert:
 *   get:
 *     summary: Get All Concerts
 *     description: Retrieve a list of all concerts.
 *     tags:
 *       - Concert
 *     responses:
 *       200:
 *          $ref: '#/components/responses/201'
 *       400:
 *         $ref: '#/components/responses/400'
 */
router.get("/", protect, getAllConcerts);
/**
 * @swagger
 * /api/v1/concert/{id}:
 *   get:
 *     summary: Get Concert by ID
 *     description: Retrieve details for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 _id: "concert_id"
 *                 season: "season_id"
 *                 name: "Concert Name"
 *                 location: "Concert Location"
 *                 day: "2023-12-05T09:59:00"
 *                 description: "Concert Description"
 *                 music: ["music_id_1", "music_id_2"]
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/:id", protect, getConcertById);

router.get("/detailed/:id", protect, getConcertByIdAll);
/**
 * @swagger
 * /api/v1/concert/{id}:
 *   delete:
 *     summary: Delete Concert by ID
 *     description: Delete a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         $ref: '#/components/responses/204'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.delete("/:id", ...admin, deleteConcertById);
/**
 * @swagger
 * /api/v1/concert/{id}:
 *   put:
 *     summary: Update Concert by ID
 *     description: Update details for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to update
 *         schema:
 *
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *             required:
 *               - name
 *               - location
 *               - description
 *           example:
 *             name: "carthagi"
 *             location: "mourouj6"
 *             description: "khayeb barsha"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.put("/:id", ...admin, updateConcertById);
/**
 * @swagger
 * /api/v1/concert/confirm/{id}:
 *   post:
 *     summary: Check Availability for Concert
 *     description: Check availability for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to check availability
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post("/confirm/:id", ...admin, checkDisponiblilte);
/**
 * @swagger
 * /api/v1/concert/final-list/{id}:
 *   get:
 *     summary: Get Final List for Concert
 *     description: Retrieve the final list for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to get the final list
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/final-list/:id", protect, getFinalList);
/**
 * @swagger
 * /api/v1/concert/get-qrcode/{id}:
 *   get:
 *     summary: Get QR Code for Concert
 *     description: Retrieve the QR code for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to get the QR code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/get-qrcode/:id", ...admin, getQrCode);
/**
 * @swagger
 * /api/v1/concert/placement/{id}:
 *   get:
 *     summary: Get Placement for Concert
 *     description: Retrieve the placement for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to get the placement
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/placement/:id", protect, getPlacement);
/**
 * @swagger
 * /api/v1/concert/confirm-all/{id}:
 *   get:
 *     summary: Confirm All for Concert
 *     description: Confirm all for a specific concert by its ID.
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to confirm all
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/confirm-all/:id", ...admin, confirmAllToConcert);
module.exports = router;
