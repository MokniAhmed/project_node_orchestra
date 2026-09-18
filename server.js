const path = require("path");
const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
// Routes
const mountRoutes = require("./routes");

const { initSwagger } = require("./swagger");
const { io } = require("./socket");

// express app
const app = express();

app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGINS === undefined
  ? "http://localhost:3000,http://localhost:5173"
  : process.env.CORS_ORIGINS).split(",").map((origin) => origin.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, false);
    if (allowedOrigins.includes(origin)) return callback(null, origin);
    return callback(new ApiError("CORS origin not allowed", 403));
  },
}));

// compress all responses
app.use(compression());

// Middlewares
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get("/health/live", (req, res) => res.status(200).json({ status: "ok" }));
app.get("/health/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

// Mount Routes
mountRoutes(app);
initSwagger(app);
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global error handling middleware for express
app.use(globalError);
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;
let socketStarted = false;
let shuttingDown = false;

async function start() {
  await dbConnection();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(PORT, () => {
      server.off("error", reject);
      resolve();
    });
  });
  io.listen(5000);
  socketStarted = true;
  console.log(`App running running on port ${PORT}`);
}

async function shutdown(exitCode) {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    if (server.listening) {
      await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
    }
    if (socketStarted) await new Promise((resolve) => io.close(resolve));
    await mongoose.disconnect();
    console.log("Shutdown complete");
    process.exit(exitCode);
  } catch (err) {
    console.error("Shutdown error:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  process.on("SIGTERM", () => shutdown(0));
  process.on("SIGINT", () => shutdown(0));
  process.on("unhandledRejection", (err) => {
    console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
    shutdown(1);
  });
  start().catch((err) => {
    console.error("Startup error:", err);
    shutdown(1);
  });
}

module.exports = { app, start };
