const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
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
  changeUserPassword,
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
} = require("../services/userService");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// router.use(authMiddleware.protect);

router.get("/getMe", getLoggedUserData, getUser);
router.post("/", createUser);
router.put("/changeMyPassword", updateLoggedUserPassword);
router.put("/updateMe", updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

router.put("/status/:id", updateStatus);

router.put("/elimination_status/:id", eliminationStatus);
router.put("/testiture/:id", updateTestitureVocale);

// Admin
// router.use(authMiddleware.allowedTo("admin"));
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router.route("/").get(getUsers).post(createUser);
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
  .get(getUserValidator, getUser)
  .delete(deleteUserValidator, deleteUser);
router.post(
  "/confirm-concert/:id",
  authMiddleware.protect,
  authMiddleware.allowedTo("chorist"),
  confirmPresence
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
  authMiddleware.protect,
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
router.put("/notification/:id", authMiddleware.protect, createNotificationRep);
module.exports = router;
