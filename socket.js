const { Server } = require("socket.io");

const { protectSocket } = require("./middlewares/authMiddleware");

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use(protectSocket);

io.on("connection", (socket) => {
  const { _id, role, list_muted, group_pupitre, email } = socket.user;

  const currentDay = new Date().toLocaleDateString();

  if (list_muted.includes(currentDay)) {
    console.log(`User ${_id} is muted for notifications today.`);
    return;
  }

  if (role === "admin") {
    socket.join("admin");
  } else {
    const userRoom = `userRoom_${email}`;
    socket.join(userRoom);
    socket.join(group_pupitre);
  }
  //console.log(socket);
  // Handle sending notifications
  socket.on("sendNotification", (data) => {
    console.log("here");
    const { userId, message } = data;
    io.to(`userRoom_${userId}`).emit("notification", { message });
    console.log(`Notification sent to ${userId}`);
  });

  socket.on("sendNotificationpupitre", (group, message) => {
    io.to(group).emit("notification", { message: message });
  });

  socket.on("sendNotificationAdmin", (message) => {
    io.to("admin").emit("notification", { message: message });
  });
});

const sendNotificationSocketToChorist = (email, message) => {
  //  console.log("second");
  //console.log(io.sockets.sockets);
  io.to(`userRoom_${email}`).emit("notification", message);
};
const sendNotificationSocketToPupitre = (pupitre, message) => {
  io.to(pupitre).emit("notification", message);
};
const sendNotificationSocketToAdmin = (message) => {
  io.to("admin").emit("notification", message);
};

module.exports = {
  io,
  sendNotificationSocketToAdmin,
  sendNotificationSocketToChorist,
  sendNotificationSocketToPupitre,
};
