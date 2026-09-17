const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
  updateStatus,
  createNotificationRep,

  eliminationStatus,
  updateTestitureVocale,
  sendNotificationUrgente,
  confirmPresence,
  declinePresence,
} = require("../services/userService");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();
const admin = [authMiddleware.protect, authMiddleware.allowedTo('admin')];

// router.use(authMiddleware.protect);

router.get("/getMe", authMiddleware.protect, getLoggedUserData, getUser);
router.post("/", ...admin, createUser);
router.put("/changeMyPassword", authMiddleware.protect, updateLoggedUserPassword);
router.put("/updateMe", authMiddleware.protect, updateLoggedUserData);
router.delete("/deleteMe", authMiddleware.protect, deleteLoggedUserData);

router.put("/status/:id", ...admin, updateStatus);

router.put("/elimination_status/:id", ...admin, eliminationStatus);
router.put("/testiture/:id", ...admin, updateTestitureVocale);

router.route("/").get(...admin, getUsers);
/**
 * @swagger
 * /confirm-concert/{id}:
 *   post:
 *     summary: Confirm Presence for Concert
 *     description: Confirm presence for a specific concert.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the concert to confirm presence for
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
router
  .route("/:id")
  .get(...admin, getUserValidator, getUser)
  .delete(...admin, deleteUserValidator, deleteUser);
router.post(
  "/confirm-concert/:id",
  authMiddleware.protect,
  authMiddleware.allowedTo("chorist"),
  confirmPresence
);
router.post(
  "/decline-concert/:id",
  authMiddleware.protect,
  authMiddleware.allowedTo("chorist"),
  declinePresence
);
/**
 * @swagger
 * /notification/urgent:
 *   post:
 *     summary: Send Urgent Notification
 *     description: Send an urgent notification.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message for the urgent notification
 *             required:
 *               - message
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.post(
  "/notification/urgent",
  ...admin,
  sendNotificationUrgente
);
/**
 * @swagger
 * /users/notification/{id}:
 *   put:
 *     summary: Create Notification for User by ID
 *     description: Create a notification for a specific user by ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to create a notification for
 *         schema:
 *           type: string
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
 *               dateNotif:
 *                 type: string
 *                 format: date-time
 *                 description: Date and time of the notification
 *               nbrNotif:
 *                 type: integer
 *                 description: Number of notifications
 *             required:
 *               - event
 *               - dateNotif
 *               - nbrNotif
 *     responses:
 *       200:
 *         $ref: '#/components/responses/200'
 *       400:
 *         $ref: '#/components/responses/400'
 *       404:
 *         $ref: '#/components/responses/404'
 */
router.put("/notification/:id", ...admin, createNotificationRep);
module.exports = router;
