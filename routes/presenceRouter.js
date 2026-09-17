const express = require("express");
const {
  markPrsence,
  addPrsenceManualy,
  demandeAbsent,
  getHistoric,
  getPorcentagePresenceInSeasonForAnyPupitre,
  getPorcentagePresenceInConcertForAnyPupitre,
} = require("../services/presenceService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");
const { route } = require("./userRoute");
const { getQrCode } = require("../services/repetitionService");

const router = express.Router();
const admin = [protect, allowedTo('admin')];
/**
 * @swagger
 * /api/v1/presence:
 *   put:
 *     summary: Mark Presence
 *     description: Mark presence for an event using QR code.
 *     tags:
 *       - Presence
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Type of the event (e.g., "concert")
 *               rep:
 *                 type: string
 *                 description: Representative information
 *               concert:
 *                 type: string
 *                 description: ID of the concert
 *           example:
 *             event: "concert"
 *             rep: ""
 *             concert: "6578626c2f06ec66f49232f8"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.put("/qrcode", protect, allowedTo('chorist'), markPrsence);
router.get("/qrcode/:id", ...admin, getQrCode);
/**
 * @swagger
 * /api/v1/presence/add-manualy/{id}:
 *   put:
 *     summary: Add Presence Manually
 *     description: Add presence manually for a specific event by ID.
 *     tags:
 *       - Presence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event to add manual presence
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the person to add manual presence
 *           example:
 *             email: "tavares_heller@yahoo.com"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.put(
  "/add-manualy/:id",
  ...admin,
  addPrsenceManualy
);
/**
 * @swagger
 * /api/v1/presence/demandeAbsent:
 *   put:
 *     summary: Request Absence
 *     description: Request absence for a representative in a specific event.
 *     tags:
 *       - Presence
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Type of the event (e.g., "rep")
 *               rep:
 *                 type: string
 *                 description: ID of the representative requesting absence
 *               concert:
 *                 type: string
 *                 description: ID of the concert (optional, can be an empty string)
 *           example:
 *             event: "rep"
 *             rep: "6575feb7dff34a3c0271ea83"
 *             concert: ""
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       401:
 *         $ref: '#/components/responses/401'
 *       403:
 *         $ref: '#/components/responses/403'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post("/demandeAbsent", protect, allowedTo('chorist'), demandeAbsent);
/**
 * @swagger
 * /api/v1/presence/nbr_presence_in_season_for_any_pupitre/{id}:
 *   get:
 *     summary: Get Number of Presence in Season for Any Pupitre
 *     description: Retrieve the number of presences in a season for any pupitre.
 *     tags:
 *       - Presence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the season to get presence statistics
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
router.get(
  "/nbr_presence_in_season_for_any_pupitre/:id",
  ...admin, getPorcentagePresenceInSeasonForAnyPupitre
);
/**
 * @swagger
 * /api/v1/presence/nbr_presence_in_concert_for_any_pupitre/{id}:
 *   get:
 *     summary: Get Number of Presence in Concert for Any Pupitre
 *     description: Retrieve the number of presences in a concert for any pupitre.
 *     tags:
 *       - Presence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to get presence statistics
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
router.get(
  "/nbr_presence_in_concert_for_any_pupitre/:id",
  ...admin, getPorcentagePresenceInConcertForAnyPupitre
);
/**
 * @swagger
 * /api/v1/presence:
 *   get:
 *     summary: Get Historic of Presence
 *     description: Retrieve the historic of presence.
 *     tags:
 *       - Presence
 *     parameters:
 *       - in: query
 *         name: rep
 *         description: ID of the representative
 *         schema:
 *           type: string
 *       - in: query
 *         name: pupitre
 *         description: Pupitre information
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         description: Presence status (e.g., "present")
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
router.get("/", ...admin, getHistoric);

module.exports = router;
