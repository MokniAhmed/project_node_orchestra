const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) Check if user exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }

  // 4) Check if user change his password after token created
  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );
    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError(
          "User recently changed his password. please login again..",
          401
        )
      );
    }
  }

  req.user = currentUser;
  next();
});
// @desc make socket authenticated
exports.protectSocket = asyncHandler(async (socket, next) => {
  try {
    // 1. Extract token from headers
    const authHeader = socket.handshake.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer") && authHeader.split(" ")[1];

    if (!token) {
      return next(new ApiError("Unauthorized", 401)); // Handle missing token
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3. Check user existence
    const currentUser = await User.findById(decoded.userId).select(
      "role group_pupitre list_muted email"
    );

    if (!currentUser) {
      throw new ApiError("Invalid user for token", 401);
    }

    // 4. Attach user to socket
    socket.user = currentUser;

    // 5. Call next middleware
    next(); // Uncomment to allow subsequent middleware execution
  } catch (error) {
    next(error);
  }
});
// @desc    Authorization (User Permissions)
// ["admin", "manager"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });
