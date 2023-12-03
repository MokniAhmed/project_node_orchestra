const Candidate = require("../models/candidateModel");
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
        sendEmail({
          email: "haythemmouna@gmail.com",
          subject: "notifer admin",
          message: "Number of new candidates created ",
          html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
            <h1 style="width: 100%;color: white; background-color:rgb(0, 229, 255);text-align: center ; padding: 10px 0px">ORCHESTRE</h1>
            <div>Number of new candidates created: ${candidates.length} </div>
        </div>`,
        });
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
