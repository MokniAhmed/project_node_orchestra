const Candidate = require("../models/candidateModel");
const { sendNotificationSocketToAdmin } = require("../socket");
const sendEmail = require("./sendEmail");

exports.startJob = async (startTime, endTime, interval, job) => {
  const currentTime = new Date();

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
      if (candidates.length > 0)
        sendNotificationSocketToAdmin(`${candidates.length}new condidate`);
      console.log(`Number of new candidates created: ${candidates.length}`);
    } catch (error) {
      console.error("Error retrieving candidates:", error);
    }
  } else if (currentTime >= endTime) {
    console.log("Stopping the job");
    if (job) {
      job.cancel(); // Cancel the job if it is provided
    }
  }
};
