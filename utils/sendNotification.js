/* eslint-disable no-plusplus */
const schedule = require("node-schedule");
const sendEmail = require("./sendEmail");

exports.sendNotification = async (options) => {
  schedule.scheduleJob(new Date(options.dateNotif), () => {
    console.log(options.listUsers.length, options.listUsers);
    let i = 0;
    const canselInt = setInterval(async () => {
      if (i > options.listUsers.length - 2) {
        clearInterval(canselInt);
      }
      console.log(options.listUsers[i].email, i);
      await sendEmail({
        email: options.listUsers[i].email,
        subject: "notifer admin",
        message: "you have repetition ",
        html: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
            you have rep
        </div>`,
      });
      i++;
    }, 1000);
  });
};
