/* eslint-disable no-plusplus */
const schedule = require("node-schedule");
const sendEmail = require("./sendEmail");

exports.sendNotification = async (options) => {
  schedule.scheduleJob(new Date(options.dateNotif), async () => {
    await sendEmail({
      email: options.users,
      subject: options.subject,
      message: options.message,
      html: options.tamplate,
    });
  });
};

const convertirDateTime = (nombreDeMillisecondes) => {
  // Convertir les millisecondes en secondes
  const nombreDeSecondes = nombreDeMillisecondes / 1000;
  // Calculer le nombre de jours, heures et minutes
  const jours = Math.floor(nombreDeSecondes / (24 * 3600));
  let resteSecondes = nombreDeSecondes % (24 * 3600);
  const heures = Math.floor(resteSecondes / 3600);
  resteSecondes %= 3600;
  const minutes = Math.floor(resteSecondes / 60);

  // Retourner le résultat
  return { jours, heures, minutes };
};

const genererRegleCron = (intervalleEnMillisecondes, nbrNotif) => {
  const secondes = Math.floor(intervalleEnMillisecondes / nbrNotif / 1000);
  const minutes = Math.floor(secondes / 60);
  const heures = Math.floor(minutes / 60);
  const jours = Math.floor(heures / 24);

  if (jours > 0) {
    return `0 12 */${jours} * *`;
    // eslint-disable-next-line no-else-return
  } else if (heures > 0) {
    return `0 */${heures} * * *`;
  } else if (minutes > 0) {
    return `*/${minutes} * * * *`;
  } else {
    return `*/1 * * * *`;
  }
};

exports.sendMultipleNotification = async (options) => {
  // const startDate = new Date(options.dateNotif).getTime();
  // const endDate = new Date(options.endNotif).getTime();
  const startDate = new Date("2023-12-08T15:11:00").getTime();
  const endDate = new Date("2023-12-08T15:13:01").getTime();
  // Calculer la différence en millisecondes entre les deux dates
  const rangeTimes = endDate - startDate;

  schedule.scheduleJob(new Date("2023-12-08T15:11:00"), async () => {
    console.log("hello2");
    // await sendEmail({
    //   email: options.users,
    //   subject: options.subject,
    //   message: options.message,
    //   html: options.tamplate,
    // });
    const sheduleM = schedule.scheduleJob(
      { rule: genererRegleCron(rangeTimes, options.nbrNotif) },
      async () => {
        const currntDate = new Date();
        if (currntDate.getTime() > endDate) {
          console.log("cancled");
          sheduleM.cancel();
        } else if (currntDate.getHours() < 6) {
          currntDate.setHours(6);
          schedule.scheduleJob(currntDate, async () => {
            console.log("hello");
          });
        } else {
          console.log("hello");
        }

        // await sendEmail({
        //   email: options.users,
        //   subject: options.subject,
        //   message: options.message,
        //   html: options.tamplate,
        // });
      }
    );
  });
};
