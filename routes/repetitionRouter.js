const express = require("express");
const {
  createRepetition,
  getAllRepetition,
  getRepeitionById,
  deleteRepetition,
  updateRepetition,
  getQrCode,
  getRepeitionDetailedById,
} = require("../services/repetitionService");

const router = express.Router();

router
  .route("/")
  /**
   * @swagger
   * /api/v1/repetition:
   *   get:
   *     summary: Get All Repetitions
   *     description: Retrieve a list of all repetitions.
   *     tags:
   *       - Repetition
   *     responses:
   *       200:
   *         $ref: '#/components/responses/200'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   */
  .get(getAllRepetition)
  /**
   * @swagger
   * /api/v1/repetition:
   *   post:
   *     summary: Create New Repetition
   *     description: Create a new repetition for a concert.
   *     tags:
   *       - Repetition
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               concert:
   *                 type: string
   *                 description: ID of the concert for the repetition
   *               location_repetition:
   *                 type: string
   *                 description: Location of the repetition
   *               day:
   *                 type: string
   *                 format: date
   *                 description: Date of the repetition (YYYY-MM-DD)
   *               start_rep:
   *                 type: string
   *                 format: date-time
   *                 description: Start time of the repetition
   *               end_rep:
   *                 type: string
   *                 format: date-time
   *                 description: End time of the repetition
   *               dateNotif:
   *                 type: string
   *                 format: date-time
   *                 description: Notification date for the repetition
   *               group_participant:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     name:
   *                       type: string
   *                       description: Name of the participant group
   *                     pourcentage:
   *                       type: number
   *                       description: Percentage of participation for the group
   *             required:
   *               - concert
   *               - location_repetition
   *               - day
   *               - start_rep
   *               - end_rep
   *               - dateNotif
   *               - group_participant
   *     responses:
   *       201:
   *         $ref: '#/components/responses/201'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   */
  .post(createRepetition);
router
  .route("/:id")
  /**
   * @swagger
   * /api/v1/repetition/{id}:
   *   get:
   *     summary: Get Repetition by ID
   *     description: Retrieve details of a specific repetition by its ID.
   *     tags:
   *       - Repetition
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the repetition to retrieve
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
  .get(getRepeitionById);
router
  .route("/detailed/:id")
  .get(getRepeitionDetailedById)
  /**
   * @swagger
   * /api/v1/repetition/{id}:
   *   patch:
   *     summary: Update Repetition by ID
   *     description: Update details of a specific repetition by its ID.
   *     tags:
   *       - Repetition
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the repetition to update
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               location_repetition:
   *                 type: string
   *                 description: New location for the repetition
   *             required:
   *               - location_repetition
   *     responses:
   *       200:
   *         $ref: '#/components/responses/200'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   */
  .patch(updateRepetition)
  /**
   * @swagger
   * /api/v1/repetition/{id}:
   *   delete:
   *     summary: Delete Repetition by ID
   *     description: Delete a specific repetition by its ID.
   *     tags:
   *       - Repetition
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the repetition to delete
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         $ref: '#/components/responses/NoContentResponse'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   */
  .delete(deleteRepetition);
router.get("/qrCode/:id", getQrCode);
module.exports = router;
