const QRCode = require("qrcode");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const factory = require("./handlersFactory");

const Repetition = require("../models/repetitionModel");
const User = require("../models/userModel");
const { sendNotification } = require("../utils/sendNotification");

// test
exports.createRepetition = asyncHandler(async (req, res, next) => {
  const { dateNotif, ...rest } = req.body;
  const repetition = await Repetition.create({ ...rest });

  const listUsers = await User.find({
    // list_muted: "2015-10-19T23:00:00.000Z",
    list_muted: { $ne: "2015-10-19T23:00:00.000Z" },
  });
  const users = listUsers.map((user) => user.email);
  sendNotification({
    users,
    dateNotif,
    subject: "notifer admin",
    message: "you have repetition ",
    tamplate: ` <div style="width: 99%;border: 1px solid rgb(0, 229, 255); display: flex; justify-content: center; align-items: center; flex-direction: column;font-family: Arial, Helvetica, sans-serif;">
                   you have rep
              </div>`,
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
