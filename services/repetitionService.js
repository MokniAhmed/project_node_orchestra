const QRCode = require("qrcode");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const factory = require("./handlersFactory");

const Repetition = require("../models/repetitionModel");
const User = require("../models/userModel");
const Historic = require("../models/historicModel");
const { sendNotification } = require("../utils/sendNotification");
const getRandomUsersBygroup = require("../utils/randomUserByGroup");
const Concert = require("../models/concertModel");

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
