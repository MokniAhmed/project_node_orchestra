const http = require("http");
const socketIO = require("socket.io");

const server = http.createServer();
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const connectedClients = {};

io.on("connection", (socket) => {
  console.log("Client connected");

  // Handle client registration
  socket.on("register", (data) => {
    console.log("Client connected", data.login);

    connectedClients[data.login] = socket.id;
    if (data.role === "admin") socket.join("Admin");
    if (data.role === "chorist") {
      socket.join(data.pupitre);
    }
  });

  // Handle sending notifications
  socket.on("sendNotification", (data) => {
    const { userId, message } = data;
    const clientSocketId = connectedClients[userId];

    if (clientSocketId) {
      io.to(clientSocketId).emit("notification", { message });
      console.log(`Notification sent to ${userId}`);
    } else {
      console.log(`Client ${userId} not found`);
    }
  });
  socket.on("sendNotificationpupitre", (data) => {
    io.to(data.pupitre).emit("notification", { message: data.message });
  });
  socket.on("sendNotificationAdmin", (data) => {
    io.to("Admin").emit("notification", { message: data.message });
  });
   
});


const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
