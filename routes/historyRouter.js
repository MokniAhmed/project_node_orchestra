const express = require("express");
const {
  getHistoryByUser,
  addPrsenceAutomatiqly,
  getStatistique,
  etatAbsentStat,
  getAbsList,
  nominatedorabsentchoriste,
  profilDetail,
} = require("../services/historicService");
const { protect, allowedTo } = require("../middlewares/authMiddleware");

const router = express.Router();
const { historyOwnerOrAdmin } = require('../middlewares/ownershipMiddleware');
const admin = [protect, allowedTo('admin')];

/**
 * @swagger
 * /api/v1/history/my-history/{id}:
 *   get:
 *     summary: Get History by User ID
 *     description: Retrieve the history for a specific user by their ID.
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to get the history
 *         schema:
 *           type: string
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
router.get(
  "/my-histroy/:id",
  protect,
  historyOwnerOrAdmin,
  getHistoryByUser
);
/**
 * @swagger
 * /api/v1/history/state-history:
 *   get:
 *     summary: Get Statistics for History
 *     description: Retrieve statistics for history.
 *     tags:
 *       - History
 *     parameters:
 *       - in: query
 *         name: critere
 *         description: Filter criteria (e.g., "chorist")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/state-history", ...admin, getStatistique);

router.post("/add-present-auto", ...admin, addPrsenceAutomatiqly);

/**
 * @swagger
 * /api/v1/history/stats-etat-rep:
 *   get:
 *     summary: Get Statistics for History based on Genre
 *     description: Retrieve statistics for history based on a specific genre.
 *     tags:
 *       - History
 *     parameters:
 *       - in: query
 *         name: genre
 *         description: Filter statistics by genre (e.g., "pupitre")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.get("/stats-etat-rep", ...admin, etatAbsentStat);
router.get("/listabs", ...admin, getAbsList);
router.post("/nomination/:id", ...admin, nominatedorabsentchoriste);
router.post("/profil/:id", ...admin, profilDetail);

module.exports = router;
