import { io } from "socket.io-client";

let socket: any = null;

export function initSocket() {
  if (socket) return socket;

  const token = localStorage.getItem("token");
  if (!token) return null;

  socket = io("http://localhost:3000", {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("Socket conectado:", socket.id);
  });

  return socket;
}

export function getSocket() {
  return socket;
}
