const schedule = require("node-schedule");

const asyncHandler = require("express-async-handler");

const Audition = require("../models/auditionModel");
const Candidate = require("../models/candidateModel");
const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const factory = require("./handlersFactory");

exports.createAudition = asyncHandler(async (req, res, next) => {
  const audit = { ...req.body, season: req.params.seasonId };
  const newAudit = await Audition.create(audit);
  //const startTime = newAudit.starting_date;
  //const endTime = newAudit.ending_date;

  let job;

  const startJob = async (startTime, endTime, interval) => {
    const currentTime = new Date();
    const currentMinute = currentTime.getMinutes();

    if (currentTime >= startTime && currentTime < endTime) {
      const minuteDiff = Math.floor((currentTime - startTime) / (1000 * 60));
      const currentInterval = Math.floor(minuteDiff / interval);

      console.log(
        `Running job at ${currentInterval} ${
          interval === 1 ? "minute" : "minutes"
        }`
      );

      // async func
      try {
        const oneMinuteAgo = new Date();
        oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
        const candidates = await Candidate.find({
          createdAt: { $gte: oneMinuteAgo },
        });
        console.log(`Number of new candidates created: ${candidates.length}`);
      } catch (error) {
        console.error("Error retrieving candidates:", error);
      }
    } else if (currentTime >= endTime) {
      console.log("Stopping the job");
      job.cancel(); // Stop the job after the end time
    }
  };
  const startTime = new Date(); // Replace with your desired start time
  const endTime = new Date(startTime.getTime() + 3 * 60 * 1000); // 3 minutes later
  const interval = 1; // Run every 1 minutes

  job = schedule.scheduleJob({ rule: "*/1 * * * *" }, () =>
    startJob(startTime, endTime, interval)
  );
  res.status(201).json({ data: newAudit });
});

exports.AllAudition = factory.getAll(Audition);
