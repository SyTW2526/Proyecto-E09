import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Header from "../components/Header/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "react-i18next";
import { authService } from "../services/authService";
import "../styles/trade-room.css";

interface UserCard {
  id: string;
  name: string;
  image: string;
  rarity: string;
}

const TradeRoomPage: React.FC = () => {
  const { t } = useTranslation();

  const user = authService.getUser();
  const userImage = user?.profileImage || "/icono.png";

  const [socket, setSocket] = useState<Socket | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [roomCode] = useState("sala-demo-123");

  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);

  const [opponentCard, setOpponentCard] = useState<UserCard | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");
  const [opponentImage, setOpponentImage] = useState<string>("/icono.png");

  const username = user?.username;
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    const s = io("http://localhost:3000", { 
      auth: { token },
      transports: ["websocket"]
    });

    setSocket(s);
    s.emit("joinRoom", roomCode);

    s.on("receiveMessage", (data: any) => {
      setMessages((prev) => [...prev, data]);
    });

    s.on("cardSelected", (data: any) => {
      setOpponentCard(data.card);
      setOpponentName(data.user);
    });

    s.on("userJoined", (data: any) => {
      if (data.user !== username) {
        setOpponentName(data.user);
      }
    });

    s.on("roomUsers", async (data: any) => {
      if (!data || !Array.isArray(data.users)) return;

      const others = data.users.filter((u: string) => u !== username);
      if (others.length > 0) {
        const opponent = others[0];
        setOpponentName(opponent);

        try {
          const res = await fetch(`http://localhost:3000/users/${opponent}`);
          const rival = await res.json();
          setOpponentImage(rival.profileImage || "/icono.png");
        } catch {
          setOpponentImage("/icono.png");
        }
      }
    });
    return () => {
      s.disconnect();
    };
  }, [username, roomCode]);

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

  return (
    <div className="trade-page">
      <Header />

      <main className="trade-main">
        <div className="trade-container">

          {/* LEFT SECTION */}
          <section className="trade-left">

            {/* TITLE */}
            <h2 className="trade-title">{t("tradeRoom.titulo")}</h2>
            <p className="trade-room-code">
              {t("tradeRoom.codigoSala")} <b>{roomCode}</b>
            </p>

            {/* PLAYER CARDS */}
            <div className="trade-fight">

              {/* YOU */}
              <div className="player-block">
                <img src={userImage} className="player-avatar" />
                <p className="player-name">{t("tradeRoom.tu")}</p>

                <div className="player-card">
                  {selectedCard ? (
                    <img src={selectedCard.image} className="selected-card" />
                  ) : (
                    <span className="no-card">{t("tradeRoom.tuCartaSel")}</span>
                  )}
                </div>
              </div>

              <div className="trade-icon">⚡</div>

              {/* OPPONENT */}
              <div className="player-block">
                <img src={opponentImage} className="player-avatar" />
                <p className="player-name opponent">
                  {opponentName || t("tradeRoom.otroUsuario")}
                </p>

                <div className="player-card">
                  {opponentCard ? (
                    <img src={opponentCard.image} className="selected-card" />
                  ) : (
                    <span className="no-card">{t("tradeRoom.cartaRival")}</span>
                  )}
                </div>
              </div>

            </div>

            <p className="trade-subtitle">{t("tradeRoom.tusCartas")}</p>

            {/* USER CARDS */}
            <div className="trade-cards-grid">
              {userCards.map((card) => (
                <div
                  key={card.id}
                  className="trade-card"
                  onClick={() => handleSelectCard(card)}
                >
                  <img src={card.image} className="trade-card-img" />
                  <p className="trade-card-title">{card.name}</p>
                </div>
              ))}
            </div>

          </section>

          {/* CHAT */}
          <aside className="trade-chat">

            <h3 className="chat-title">{t("tradeRoom.chat")}</h3>

            <div className="chat-box">
              <div className="chat-messages">
                {messages.map((m, i) => (
                  <div key={i} className="chat-msg">
                    <strong>{m.user || t("tradeRoom.otroUsuario")}:</strong> {m.text}
                  </div>
                ))}
              </div>
            </div>

            {/* INPUT */}
            <div className="chat-input-box">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("tradeRoom.escribeMensaje")}
                className="chat-input"
              />
              <button onClick={handleSend} className="chat-send">
                {t("tradeRoom.enviar")}
              </button>
            </div>

            {/* BUTTONS */}
            <div className="trade-actions">
              <button className="btn-accept">{t("tradeRoom.aceptar")}</button>
              <button className="btn-reject">{t("tradeRoom.rechazar")}</button>
            </div>

          </aside>

        </div>
      </main>

      <footer className="trade-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default TradeRoomPage;
