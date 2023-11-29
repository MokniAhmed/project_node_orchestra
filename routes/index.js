
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const condidateRoute = require("./condidateRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/condidate", condidateRoute);
};

module.exports = mountRoutes;
