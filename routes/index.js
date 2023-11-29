const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const candidateRoute = require("./candidateRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/candidate", candidateRoute);
};

module.exports = mountRoutes;
