const express = require("express");

const musicalService = require("../services/musicalService");

const {
  createNewMusicalValidator,
  deleteMusicalValidator,
  updateMusicalValidator,
  getMusicalByIdValidator,
} = require("../utils/validators/musicalValidator");

const router = express.Router();
const { protect, allowedTo } = require('../middlewares/authMiddleware');
const admin = [protect, allowedTo('admin')];
router
  .route("/")
  /**
   * @swagger
   * /api/v1/musical:
   *   post:
   *     summary: Create a New Musical Piece
   *     description: Create a new musical piece with the provided details.
   *     tags:
   *       - Musical
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               composator:
   *                 type: array
   *                 items:
   *                   type: string
   *               genre:
   *                 type: string
   *               lyrics:
   *                 type: string
   *               arrangeurs:
   *                 type: string
   *               date_composition:
   *                 type: string
   *                 format: date
   *               part_choeur:
   *                 type: boolean
   *               presence_Choeur:
   *                 type: boolean
   *               pupitre:
   *                 type: array
   *                 items:
   *                   type: string
   *           example:
   *             title: "musk1"
   *             composator: ["narachh"]
   *             genre: "adadadadada"
   *             lyrics: "ya nes jaratli 8arayeb s"
   *             arrangeurs: "aloloalaoalaa"
   *             date_composition: "2014-10-20"
   *             part_choeur: true
   *             presence_Choeur: true
   *             pupitre: ["first", "second"]
   *     responses:
   *       201:
   *         $ref: '#/components/responses/201'
   *       400:
   *         $ref: '#/components/responses/400'
   */
  .post(...admin, createNewMusicalValidator, musicalService.createMusical)
  /**
   * @swagger
   * /api/v1/musical:
   *   get:
   *     summary: Get All Musical Pieces
   *     description: Retrieve a list of all musical pieces.
   *     tags:
   *       - Musical
   *     responses:
   *       200:
   *         $ref: '#/components/responses/200'
   *       404:
   *         $ref: '#/components/responses/404'
   */
  .get(protect, musicalService.getAllMusical);

router
  .route("/:id")
  /**
   * @swagger
   * /api/v1/musical/{id}:
   *   put:
   *     summary: Update Musical Piece by ID
   *     description: Update details for a specific musical piece by its ID.
   *     tags:
   *       - Musical
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the musical piece to update
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               composator:
   *                 type: array
   *                 items:
   *                   type: string
   *               genre:
   *                 type: string
   *               lyrics:
   *                 type: string
   *               arrangeurs:
   *                 type: string
   *               date_composition:
   *                 type: string
   *                 format: date
   *               part_choeur:
   *                 type: boolean
   *               presence_Choeur:
   *                 type: boolean
   *               pupitre:
   *                 type: array
   *                 items:
   *                   type: string
   *           example:
   *             title: "updatedTitle"
   *             composator: ["updatedComposer"]
   *             genre: "updatedGenre"
   *             lyrics: "updatedLyrics"
   *             arrangeurs: "updatedArrangers"
   *             date_composition: "2022-01-20"
   *             part_choeur: false
   *             presence_Choeur: true
   *             pupitre: ["updatedPupitre"]
   *     responses:
   *       200:
   *         $ref: '#/components/responses/200'
   *       400:
   *         $ref: '#/components/responses/400'
   *       404:
   *         $ref: '#/components/responses/404'
   */
  .put(...admin, updateMusicalValidator, musicalService.updateMusical)
  /**
   * @swagger
   * /api/v1/musical/{id}:
   *   get:
   *     summary: Get Musical Piece by ID
   *     description: Retrieve details for a specific musical piece by its ID.
   *     tags:
   *       - Musical
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the musical piece to retrieve
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
  .get(protect, getMusicalByIdValidator, musicalService.getMusicalById)
  /**
   * @swagger
   * /api/v1/musical/{id}:
   *   delete:
   *     summary: Delete Musical Piece by ID
   *     description: Delete a specific musical piece by its ID.
   *     tags:
   *       - Musical
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the musical piece to delete
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
  .delete(...admin, deleteMusicalValidator, musicalService.deleteMusicalById);

module.exports = router;
