const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const auditRoute = require("./auditionRouter");
const candidateRoute = require("./candidateRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);

  app.use("/api/v1/candidate", candidateRoute);
  app.use("/api/v1/audition", auditRoute);
};

module.exports = mountRoutes;
