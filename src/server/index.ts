import express from "express";
import http from "http";
import cors from "cors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";
import "./db/mongoose.js";

import { defaultRouter } from "./routers/default.js";
import { userRouter } from "./routers/users.js";
import { pokemonRouter } from "./routers/pokemon.js";
import { userCardRouter } from "./routers/usercard.js";
import { tradeRouter } from "./routers/trade.js";
import { cardRouter } from "./routers/card.js";
import { syncRouter } from "./routers/api.js";
import { notificationRouter } from "./routers/notification.js";
import { preferencesRouter } from "./routers/preferences.js";
import { tradeRequestRouter } from "./routers/trade_request.js";
import { friendTradeRoomsRouter } from "./routers/friend_trade.js";
import { ChatMessage } from "./models/Chat.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  },
});

app.use((req: any, _res, next) => {
  req.io = io;
  next();
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

  socket.on("joinRoom", (roomCode: string) => {
    socket.join(roomCode);
    console.log(`${socket.data.username} se unió a sala ${roomCode}`);

    socket.to(roomCode).emit("userJoined", {
      user: socket.data.username,
      userId: socket.data.userId,
    });

    const usersInRoom = Array.from(
      io.sockets.adapter.rooms.get(roomCode) || []
    )
      .map((id) => io.sockets.sockets.get(id)?.data.username)
      .filter(Boolean) as string[];

    socket.emit("roomUsers", { users: usersInRoom });
  });

  socket.on("sendMessage", (data: any) => {
    socket.to(data.roomCode).emit("receiveMessage", {
      user: socket.data.username,
      userId: socket.data.userId,
      text: data.text,
    });
  });

  socket.on("selectCard", (data: any) => {
    const { roomCode, card } = data;
    socket.to(roomCode).emit("cardSelected", {
      user: socket.data.username,
      userId: socket.data.userId,
      card,
    });
  });

  socket.on("tradeReady", (data: any) => {
    const { roomCode, accepted } = data;
    socket.to(roomCode).emit("tradeReady", {
      user: socket.data.username,
      userId: socket.data.userId,
      accepted: !!accepted,
    });
  });

  socket.on("privateMessage", async (msg: any) => {
    const { from, to, text } = msg;
    console.log(`Mensaje privado de ${from} a ${to}: ${text}`);

    try {
      await ChatMessage.create({ from, to, text });

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

app.use(userRouter);
app.use(notificationRouter);
app.use(preferencesRouter);
app.use(syncRouter);
app.use(cardRouter);
app.use(tradeRouter);
app.use(userCardRouter);
app.use(pokemonRouter);
app.use(tradeRequestRouter);
app.use(friendTradeRoomsRouter);
app.use(defaultRouter);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Servidor listo en http://localhost:${port}`);
});
