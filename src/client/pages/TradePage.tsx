import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";
import { updateTradeStatus, fetchUserTrades } from "@/features/trades/tradesSlice";
import Header from "../components/Header/Header";
import Footer from "@/components/Footer";
import type { AppDispatch } from "@/store/store";

interface UserCard {
  id: number;
  name: string;
  image: string;
  rarity: string;
}

const TradeRoomPage: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const trades = useSelector((state: any) => state.trades.list);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomCode] = useState("sala-demo-123");

  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const tradeId = trades[0]?.id ?? "trade123";

  useEffect(() => {
    dispatch(fetchUserTrades("currentUserId"));
    setUserCards([
      { id: 1, name: "Pikachu", image: "/cards/card1.png", rarity: "Raro" },
      { id: 2, name: "Charmander", image: "/cards/card2.png", rarity: "Común" },
      { id: 3, name: "Bulbasaur", image: "/cards/card3.png", rarity: "Épico" },
      { id: 4, name: "Squirtle", image: "/cards/card4.png", rarity: "Común" },
      { id: 5, name: "Jigglypuff", image: "/cards/card5.png", rarity: "Raro" },
    ]);
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const s = io("http://localhost:3000", { auth: { token }, transports: ["websocket"] });
    setSocket(s);
    s.emit("joinRoom", roomCode);
    const onReceive = (data: { user?: string; text: string; roomCode: string }) =>
      setMessages((prev) => [...prev, data]);
    s.on("receiveMessage", onReceive);
    return () => {
      s.off("receiveMessage", onReceive);
      s.disconnect();
    };
  }, [roomCode]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    const message = { text: input, roomCode };
    socket.emit("sendMessage", message);
    setMessages((prev) => [...prev, { ...message, user: "Tú" }]);
    setInput("");
  };

  const handleAccept = () => {
    dispatch(updateTradeStatus({ tradeId, status: "accepted" }));
    socket?.emit("sendMessage", { text: "El intercambio fue aceptado.", roomCode });
  };

  const handleReject = () => {
    dispatch(updateTradeStatus({ tradeId, status: "rejected" }));
    socket?.emit("sendMessage", { text: "El intercambio fue rechazado.", roomCode });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-sky-200 to-blue-300 text-gray-900">
      <Header />
<main className="flex-1 w-full flex justify-center px-6 py-12">
  <div className="w-full max-w-7xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-sky-200 flex flex-col overflow-hidden pb-32 mb-28">

    <div className="flex flex-col lg:flex-row flex-grow">

      {/* SECCIÓN IZQUIERDA */}
      <section className="flex-1 p-10 flex flex-col items-center relative pb-40 lg:pb-56">
        <h2 className="text-4xl font-extrabold text-sky-700 mb-4 tracking-tight text-center">
          SALA PRIVADA
        </h2>
        <p className="text-gray-700 mb-10 text-sm">
          Código de sala: <b>{roomCode}</b>
        </p>

        {/* CARTAS ENFRENTADAS */}
        <div className="flex flex-row justify-center items-center gap-20 mb-14">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-sky-300 to-sky-500 rounded-full border-4 border-white shadow-lg mb-3" />
            <p className="font-bold text-sky-800 text-lg mb-2">Tú</p>
            <div className="w-48 h-72 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-2xl shadow-md flex items-center justify-center hover:shadow-lg hover:scale-[1.03] transition">
              <span className="text-gray-400 text-xs">Tu carta seleccionada</span>
            </div>
          </div>

          <div className="text-6xl font-extrabold text-sky-600 select-none">⚡</div>

          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-full border-4 border-white shadow-lg mb-3" />
            <p className="font-bold text-blue-800 text-lg mb-2">Otro usuario</p>
            <div className="w-48 h-72 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-2xl shadow-md flex items-center justify-center hover:shadow-lg hover:scale-[1.03] transition">
              <span className="text-gray-400 text-xs">Carta rival</span>
            </div>
          </div>
        </div>

        {/* COLECCIÓN */}
        <div className="text-center mb-6 w-full">
          <p className="text-sm font-semibold text-gray-600 mb-4">Tu colección</p>
          <div className="flex flex-wrap justify-center gap-6">
            {userCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-xl border border-gray-200 shadow-md p-3 w-28 hover:shadow-xl hover:scale-105 transition cursor-pointer"
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="rounded-md w-full h-32 object-cover mb-1"
                />
                <p className="text-center text-xs font-semibold text-gray-700 truncate">
                  {card.name}
                </p>
                <p className="text-center text-[10px] text-gray-500">{card.rarity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <div className="absolute right-12 bottom-20 sm:right-20 sm:bottom-24 md:right-28 md:bottom-28 lg:right-36 lg:bottom-32 z-10">
          <div className="flex gap-6">
            <button
              onClick={handleAccept}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold w-44 py-3 rounded-xl shadow-md hover:scale-[1.02] transition text-base"
            >
              ACEPTAR
            </button>
            <button
              onClick={handleReject}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white font-extrabold w-44 py-3 rounded-xl shadow-md hover:scale-[1.02] transition text-base"
            >
              RECHAZAR
            </button>
          </div>
        </div>
      </section>

      {/* CHAT */}
      <aside className="w-full lg:w-[28rem] bg-white border-l border-gray-200 flex flex-col p-6 rounded-br-3xl">
        <h3 className="font-extrabold text-sky-700 text-center text-2xl mb-6 tracking-wide">
          CHAT
        </h3>

        <div className="flex-1 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl shadow-inner p-5 mb-8 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.user === "Tú" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-5 py-3 max-w-[75%] text-sm font-medium leading-snug rounded-lg shadow ${
                  m.user === "Tú"
                    ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                {m.user && m.user !== "Tú" && (
                  <p className="text-xs font-semibold mb-1 text-sky-700 opacity-80">{m.user}</p>
                )}
                <p className="break-words">{m.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-300 rounded-lg shadow-md flex items-center overflow-hidden px-2 py-2">
          <input
            className="flex-1 px-4 py-2 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-500"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold w-32 py-2 hover:scale-[1.05] hover:shadow-lg transition text-lg rounded-md"
          >
            Enviar
          </button>
        </div>
      </aside>
    </div>
    <div className="h-12" />
   </div>
 </main>
 
 {/* FOOTER */}
 <footer className="bg-black text-white text-center text-[11px] py-3 leading-snug mt-10 border-t border-gray-800 shadow-inner">
   <div className="max-w-7xl mx-auto">
     <Footer />
   </div>
 </footer>
     </div>
   );
 };

 export default TradeRoomPage;

