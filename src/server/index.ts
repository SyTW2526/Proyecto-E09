import http from "http";
import { Server } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { app } from "./api.js";
import { ChatMessage } from "./models/Chat.js"; 

const port = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu-clave-secreta"
    ) as JwtPayload;

    socket.data.userId = decoded.userId;
    socket.data.username = decoded.username;

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.data.username}`);
  const privateRoom = `user:${socket.data.userId}`;
  socket.join(privateRoom);

  socket.on("joinRoom", (roomCode) => {
    socket.join(roomCode);
    console.log(`${socket.data.username} se unió a la sala ${roomCode}`);

    socket.to(roomCode).emit("userJoined", {
      user: socket.data.username,
      userId: socket.data.userId,
    });

    const usersInRoom = Array.from(
      io.sockets.adapter.rooms.get(roomCode) || []
    )
      .map((id) => io.sockets.sockets.get(id)?.data.username)
      .filter(Boolean);

    socket.emit("roomUsers", { users: usersInRoom });
  });

  socket.on("sendMessage", (data) => {
    socket.to(data.roomCode).emit("receiveMessage", {
      user: socket.data.username,
      userId: socket.data.userId,
      text: data.text,
    });
  });

  socket.on("privateMessage", async (msg) => {
    const { from, to, text } = msg;
    console.log(`Mensaje privado de ${from} a ${to}: ${text}`);
    try {
      await ChatMessage.create({
        from,
        to,
        text,
      });

      io.to(`user:${to}`).emit("privateMessage", {
        from,
        to,
        text,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error guardando mensaje privado:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.data.username}`);
  });
});

server.listen(port, () => {
  console.log(`Servidor HTTP listo en http://localhost:${port}`);
});
