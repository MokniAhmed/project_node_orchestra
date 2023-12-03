const userRoute = require("./userRoute");
const authRoute = require("./authRoute");

const auditRoute = require("./auditionRouter");

const seasonRoute = require("./seasonRoute");

const concertRoute = require("./concertRoute");

const musicalRoute = require("./musicalRoute");
const repetitionRoute = require("./repetitionRouter");


const candidateRoute = require("./candidateRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);

  app.use("/api/v1/candidate", candidateRoute);

  app.use("/api/v1/audition", auditRoute);

  app.use("/api/v1/season", seasonRoute);

  app.use("/api/v1/concert", concertRoute);

  app.use("/api/v1/musical", musicalRoute);

  app.use("/api/v1/repetition", repetitionRoute);

};

module.exports = mountRoutes;
