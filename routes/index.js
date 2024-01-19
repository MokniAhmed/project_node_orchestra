const userRoute = require("./userRoute");
const authRoute = require("./authRoute");

const auditRoute = require("./auditionRouter");

const seasonRoute = require("./seasonRoute");

const concertRoute = require("./concertRoute");

const musicalRoute = require("./musicalRoute");
const repetitionRoute = require("./repetitionRouter");
const breaksRoute = require("./breaksRoute");

const presenceRouter = require("./presenceRouter");
const historyRouter = require("./historyRouter");

const candidateRoute = require("./candidateRoute");

const mountRoutes = (app) => {
  // Swagger  for Users
  /**
   * @swagger
   * tags:
   *   name: Users
   *   description: Operations related to users
   */
  app.use("/api/v1/users", userRoute);

  // Swagger  for Auth
  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: Operations related to authentication
   */
  app.use("/api/v1/auth", authRoute);

  // Swagger  for Candidate
  /**
   * @swagger
   * tags:
   *   name: Candidate
   *   description: Operations related to candidates
   */
  app.use("/api/v1/candidate", candidateRoute);

  // Swagger  for Audition
  /**
   * @swagger
   * tags:
   *   name: Audition
   *   description: Operations related to auditions
   */
  app.use("/api/v1/audition", auditRoute);

  // Swagger  for Season
  /**
   * @swagger
   * tags:
   *   name: Season
   *   description: Operations related to seasons
   */
  app.use("/api/v1/season", seasonRoute);

  // Swagger  for Concert
  /**
   * @swagger
   * tags:
   *   name: Concert
   *   description: Operations related to concerts
   */
  app.use("/api/v1/concert", concertRoute);

  // Swagger  for Musical
  /**
   * @swagger
   * tags:
   *   name: Musical
   *   description: Operations related to musicals
   */
  app.use("/api/v1/musical", musicalRoute);

  // Swagger  for Repetition
  /**
   * @swagger
   * tags:
   *   name: Repetition
   *   description: Operations related to repetitions
   */
  app.use("/api/v1/repetition", repetitionRoute);

  // Swagger  for Breaks
  /**
   * @swagger
   * tags:
   *   name: Breaks
   *   description: Operations related to breaks
   */
  app.use("/api/v1/breaks", breaksRoute);

  // Swagger  for Presence
  /**
   * @swagger
   * tags:
   *   name: Presence
   *   description: Operations related to presence
   */
  app.use("/api/v1/presence", presenceRouter);

  // Swagger  for History
  /**
   * @swagger
   * tags:
   *   name: History
   *   description: Operations related to history
   */
  app.use("/api/v1/history", historyRouter);
};

module.exports = mountRoutes;
