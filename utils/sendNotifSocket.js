const io = require("socket.io-client");

const socket = io("http://localhost:5000");

exports.sendNotificationSocket = () => {
  const userId = "mokni.ahmed.am@gmail.com";
  const message = "Hello from the server!";
  socket.emit("sendNotification", { userId, message });
};
