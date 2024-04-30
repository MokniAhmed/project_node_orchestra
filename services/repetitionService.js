const QRCode = require("qrcode");
const schedule = require("node-schedule");
const asyncHandler = require("express-async-handler");
const Season = require("../models/seasonModel");

const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");

const Repetition = require("../models/repetitionModel");
const User = require("../models/userModel");
const Historic = require("../models/historicModel");
const { sendNotification } = require("../utils/sendNotification");
const getRandomUsersBygroup = require("../utils/randomUserByGroup");
const Concert = require("../models/concertModel");
const sendEmail = require("../utils/sendEmail");

// test
exports.createRepetition = asyncHandler(async (req, res, next) => {
  const { dateNotif, group_participant, ...rest } = req.body;
  let nameTofiltre;
  if (group_participant) {
    nameTofiltre = group_participant.map((group) => group.name);
  }
  const concert = await Concert.findById(req.body.concert);
  const listUsers = await User.find({
    role: "chorist",
    list_muted: { $ne: req.body.day },
    group_pupitre: { $in: nameTofiltre },
  });
  const finalList = getRandomUsersBygroup(listUsers, group_participant);
  const usersEmail = finalList.map((user) => user.email);
  const usersId = finalList.map((user) => user._id);

  const repetition = await Repetition.create({
    music: concert.music,
    group_participant,
    ...rest,
    list_invited: usersId,
  });

  sendNotification({
    users: usersEmail,
    dateNotif,
    subject: "notifer admin",
    message: "you have repetition ",
    tamplate: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
                   you have rep
              </div>`,
  });
  await Promise.all(
    finalList.map(async (user) => {
      await Historic.create({
        user_sender: user._id,
        pupitre: user.group_pupitre,
        event: "rep",
        date: repetition.day,
        music: repetition.music,
        rep: repetition._id,
        concert: repetition.concert,
        season: concert.season,
      });
    })
  );
  await schedule.scheduleJob(new Date(req.body.end_rep), async () => {
    console.log(repetition.end_rep);

    const activeSeason = await Season.findById(concert.season);
    const maxAbs = activeSeason.max_absence;
    const nominamtions = activeSeason.nomination;
    console.log(activeSeason);
    const listHis = await Historic.find({
      event: "rep",
      rep: repetition._id,
      status: "absent",
    });
    const listUserNomination = [];
    const listUserAbcent = [];
    await Promise.all(
      listHis.map(async (his) => {
        const user = await User.findById(his.user_sender);
        user.nb_absence += 1;
        //change elimination status
        if (user.nb_absence > nominamtions && user.nb_absence < maxAbs) {
          activeSeason.nominatedMembers.push({
            memberId: user._id,
            nom: user.nom,
          });
          listUserNomination.push(user.email);
        } else if (user.nb_absence > maxAbs) {
          activeSeason.absentMembers.push({
            memberId: user._id,
            nom: user.firstName,
          });
          listUserAbcent.push(user.email);

          user.status_elimination = "absence";
        }

        await user.save();
      })
    );

    if (listUserNomination.length !== 0) {
      await sendEmail({
        email: listUserNomination,
        subject: "Nomination",
        message: "user.message",
        html: "user.tamplate",
      });
    }
    if (listUserAbcent.length !== 0) {
      await sendEmail({
        email: listUserAbcent,
        subject: "abcent",
        message: "elemine",
        html: "user.tamplate",
      });
    }

    const seasonn = await activeSeason.save();
    console.log(seasonn);
  });
  res.status(200).json({ data: repetition });
});

exports.updateRepetition = factory.updateOne(Repetition);
exports.deleteRepetition = factory.deleteOne(Repetition);
exports.getAllRepetition = factory.getAll(Repetition);
exports.getRepeitionById = factory.getOne(Repetition);
exports.getQrCode = asyncHandler(async (req, res, next) => {
  const url = `localhost:8000/api/v1/presence/qrcode/${req.params.id}`;
  QRCode.toDataURL(url, (err, qrCodeUrl) => {
    if (err) {
      next(new ApiError("there s error in the generation of code ", 500));
    } else {
      res.send(`
      <!DOCTYPE HTML>
      <html>
      <head>
            <title>QR Code Generator </title>
      </head>
      <body>
      <img src="${qrCodeUrl}" alt="QR Code" />
        <p> Scan the QR Code to indicate the presence </p>
      </body>
      </html>
        `);
    }
  });
});
