import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Header from "../components/Header/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";

interface UserCard {
  id: string;
  name: string;
  image: string;
  rarity: string;
}

const TradeRoomPage: React.FC = () => {
  const { t } = useTranslation();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomCode] = useState("sala-demo-123");

  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [opponentCard, setOpponentCard] = useState<UserCard | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");

  const username = localStorage.getItem("username");

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const s = io("http://localhost:3000", { auth: { token }, transports: ["websocket"] });
    setSocket(s);

    s.emit("joinRoom", roomCode);

    const onReceive = (data: any) => setMessages((prev) => [...prev, data]);

    const onCardSelected = (data: any) => {
      setOpponentCard(data.card);
      setOpponentName(data.user);
    };

    const onUserJoined = (data: any) => {
      if (data.user !== username) {
        setOpponentName(data.user);
      }
    };

    const onRoomUsers = (data: any) => {
      const others = data.users.filter((u: string) => u !== username);
      if (others.length > 0) {
        setOpponentName(others[0]);
      } else {
        setOpponentName(t("tradeRoom.otroUsuario"));
      }
    };

    s.on("receiveMessage", onReceive);
    s.on("cardSelected", onCardSelected);
    s.on("userJoined", onUserJoined);
    s.on("roomUsers", onRoomUsers);

    return () => {
      s.off("receiveMessage", onReceive);
      s.off("cardSelected", onCardSelected);
      s.off("userJoined", onUserJoined);
      s.off("roomUsers", onRoomUsers);
      s.disconnect();
    };
  }, [roomCode, username, t]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`http://localhost:3000/usercards/${username}?forTrade=true`);
        const data = await res.json();
        setUserCards(data.cards || []);
      } catch (error) {
        console.error("Error al obtener cartas:", error);
        setUserCards([]);
      }
    };

    if (username) fetchCards();
  }, [username]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    const message = { text: input, roomCode };

    socket.emit("sendMessage", message);
    setMessages((prev) => [...prev, { ...message, user: t("tradeRoom.tu") }]);
    setInput("");
  };

  const handleSelectCard = (card: UserCard) => {
    setSelectedCard(card);
    socket?.emit("selectCard", { roomCode, card, user: username });
  };

  const handleAccept = () => {
    socket?.emit("sendMessage", { text: t("tradeRoom.mensajeAceptado"), roomCode });
  };

  const handleReject = () => {
    socket?.emit("sendMessage", { text: t("tradeRoom.mensajeRechazado"), roomCode });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-sky-200 to-blue-300 text-gray-900">
      <Header />

      <main className="flex-1 w-full flex justify-center px-6 py-12">
        <div className="w-full max-w-7xl bg-white rounded-3xl border border-gray-200 flex flex-col overflow-visible pb-32 mb-28">

          <div className="flex flex-col lg:flex-row flex-grow">

            {/* SECCIÓN PRINCIPAL */}
            <section className="flex-1 p-10 flex flex-col items-center relative pb-40 lg:pb-56">

              <h2 className="text-4xl font-extrabold text-sky-700 mb-4 tracking-tight text-center">
                {t("tradeRoom.titulo")}
              </h2>

              <p className="text-gray-700 mb-10 text-sm">
                {t("tradeRoom.codigoSala")} <b>{roomCode}</b>
              </p>

              {/* CARTAS ENFRENTADAS */}
              <div className="flex flex-row justify-center items-center gap-20 mb-14">

                {/* TU */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-tr from-sky-300 to-sky-500 rounded-full border-4 border-white shadow-lg mb-3" />

                  <p className="font-bold text-sky-800 text-lg mb-2">
                    {t("tradeRoom.tu")}
                  </p>

                  <div className="w-48 h-72 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-2xl shadow-md flex items-center justify-center overflow-hidden">
                    {selectedCard ? (
                      <img src={selectedCard.image} alt={selectedCard.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">{t("tradeRoom.tuCartaSel")}</span>
                    )}
                  </div>
                </div>

                <div className="text-6xl font-extrabold text-sky-600 select-none">⚡</div>

                {/* RIVAL */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-full border-4 border-white shadow-lg mb-3" />

                  <p className="font-bold text-blue-800 text-lg mb-2">
                    {opponentName || t("tradeRoom.otroUsuario")}
                  </p>

                  <div className="w-48 h-72 bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-300 rounded-2xl shadow-md flex items-center justify-center overflow-hidden">
                    {opponentCard ? (
                      <img src={opponentCard.image} alt={opponentCard.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">{t("tradeRoom.cartaRival")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* TUS CARTAS */}
              <p className="text-sm font-semibold text-gray-600 mb-4">
                {t("tradeRoom.tusCartas")}
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                {userCards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    className={`cursor-pointer bg-white rounded-xl border-2 shadow-md p-3 w-28 transition ${
                      selectedCard?.id === card.id
                        ? "border-sky-500 shadow-lg scale-[1.03]"
                        : "border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    <img src={card.image} alt={card.name} className="rounded-md w-full h-32 object-cover mb-1" />
                    <p className="text-center text-xs font-semibold text-gray-700 truncate">{card.name}</p>
                    <p className="text-center text-[10px] text-gray-500">{card.rarity}</p>
                  </div>
                ))}
              </div>

              {/* ACEPTAR / RECHAZAR */}
              <div className="absolute right-24 -bottom-2 sm:right-32 sm:-bottom-4 md:right-44 md:-bottom-8 lg:right-56 lg:-bottom-10 z-30">
                <div className="flex gap-6">
                  <button
                    onClick={handleAccept}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white font-extrabold w-44 py-3 rounded-xl shadow-md hover:scale-[1.02] transition text-base"
                  >
                    {t("tradeRoom.aceptar")}
                  </button>

                  <button
                    onClick={handleReject}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white font-extrabold w-44 py-3 rounded-xl shadow-md hover:scale-[1.02] transition text-base"
                  >
                    {t("tradeRoom.rechazar")}
                  </button>
                </div>
              </div>

            </section>

            {/* CHAT */}
            <aside
              className="w-full lg:w-[28rem] flex flex-col p-6 rounded-br-3xl"
              style={{ backgroundColor: "#ffffff", boxShadow: "none" }}
            >
              <h3 className="font-extrabold text-sky-700 text-center text-2xl mb-6 tracking-wide">
                {t("tradeRoom.chat")}
              </h3>

              <div
                className="flex-1 overflow-y-auto border border-gray-200 rounded-xl mb-12 scroll-smooth"
                style={{
                  background: "linear-gradient(to bottom right, #f8fafc, #eef4fb)",
                  padding: "1.25rem 1rem 2.5rem 1rem",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <div className="flex flex-col gap-2.5">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.user === t("tradeRoom.tu") ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`flex flex-col justify-center rounded-xl shadow-sm ${
                          m.user === t("tradeRoom.tu")
                            ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white ml-auto text-right items-end"
                            : "bg-white border border-gray-200 text-gray-900 mr-auto text-left items-start"
                        }`}
                        style={{
                          display: "inline-block",
                          maxWidth: "70%",
                          padding: "0.3rem 0.7rem",
                          fontSize: "0.9rem",
                          lineHeight: "1.2rem",
                          wordBreak: "break-word"
                        }}
                      >
                        {m.user && m.user !== t("tradeRoom.tu") && (
                          <p className="text-xs font-semibold mb-0.5 text-sky-700 opacity-80 leading-none">
                            {m.user}
                          </p>
                        )}

                        <p style={{ margin: 0, textAlign: m.user === t("tradeRoom.tu") ? "right" : "left" }}>
                          {m.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* INPUT */}
              <div className="bg-white border border-gray-300 rounded-lg shadow-md flex items-center overflow-hidden px-3 py-2 mt-4 mb-4">
                <input
                  className="flex-1 py-2 text-base text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-gray-500 rounded-md"
                  placeholder={t("tradeRoom.escribeMensaje")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                <button
                  onClick={handleSend}
                  className="
                    bg-gradient-to-r from-sky-500 to-sky-600
                    text-white font-semibold px-5 py-2
                    rounded-md text-lg
                    shadow-md
                    hover:brightness-105
                    active:translate-y-[2px] active:shadow-inner
                    transition
                  "
                >
                  {t("tradeRoom.enviar")}
                </button>
              </div>
            </aside>

          </div>

          <div className="h-12" />
        </div>
      </main>

      <footer className="bg-black text-white text-[11px] mt-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-4">
          <Footer />
        </div>
      </footer>
    </div>
  );
};

export default TradeRoomPage;
