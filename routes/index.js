
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const seasonRoute = require("./seasonRoute");
// const musicalRoute = require("./musicalRoute");

const candidateRoute = require("./candidateRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);

  app.use("/api/v1/candidate", candidateRoute);
  app.use("/api/v1/season", seasonRoute);
  // app.use("/api/v1/musical", musicalRoute);
};

module.exports = mountRoutes;
