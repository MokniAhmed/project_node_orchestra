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
  eliminationStatus,
  updateTestitureVocale,
} = require("../services/userService");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// router.use(authMiddleware.protect);

router.get("/getMe", getLoggedUserData, getUser);
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
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .delete(deleteUserValidator, deleteUser);

module.exports = router;
