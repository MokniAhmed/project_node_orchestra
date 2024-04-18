const schedule = require("node-schedule");

const asyncHandler = require("express-async-handler");
const { startJob } = require("../utils/startJob");
const Audition = require("../models/auditionModel");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const {
  sendNotificationSocketToChorist,
  sendNotificationSocketToPupitre,
} = require("../socket");

exports.createAudition = asyncHandler(async (req, res, next) => {
  const audit = { ...req.body, season: req.params.seasonId };
  const newAudit = await Audition.create(audit);
  //const startTime = newAudit.starting_date;
  //const endTime = newAudit.ending_date;

  const startTime = new Date(); // Replace with your desired start time
  const endTime = new Date(startTime.getTime() + 3 * 60 * 1000); // 3 minutes later
  const interval = 1; // Run every 1 minutes

  const job = schedule.scheduleJob({ rule: "*/1 * * * *" }, () =>
    startJob(startTime, endTime, interval, job)
  );

  res.status(201).json({ data: newAudit });
});

exports.AllAudition = factory.getAll(Audition);

exports.getPlanningByAuditId = asyncHandler(async (req, res, next) => {
  const audition = await Audition.findById(req.params.id)
    .select("planning") // Select the entire planning array
    .populate({
      path: "planning.candidate",
      select: "firstName email", //getting the name and email
    })
    .lean();

  if (!audition) {
    return next(new ApiError("Audition not found", 404));
  }

  // The 'planning' array is already populated
  res.status(200).json({ data: audition.planning });
});
