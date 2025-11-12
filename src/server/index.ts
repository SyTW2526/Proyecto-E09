import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { app } from "./api.js";

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    socket.data.userId = decoded._id;
    socket.data.username = decoded.username;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.data.username} (${socket.id})`);

  socket.on("joinRoom", (roomCode: string) => {
    socket.join(roomCode);
    console.log(`${socket.data.username} se unió a la sala: ${roomCode}`);
  });

  socket.on("sendMessage", (data) => {
    console.log(`Mensaje de ${socket.data.username}: ${data.text}`);
    io.to(data.roomCode).emit("receiveMessage", {
      user: socket.data.username,
      userId: socket.data.userId,
      text: data.text,
      roomCode: data.roomCode,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.data.username} se desconectó`);
  });
});

server.listen(port, () => {
  console.log(`Servidor HTTP corriendo en http://localhost:${port}`);
});
