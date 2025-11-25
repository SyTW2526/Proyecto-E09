import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { initSocket, getSocket } from "../socket";
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
  const username = user?.username;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [roomCode] = useState("sala-demo-123");

  const [userCards, setUserCards] = useState<UserCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [cardsPage, setCardsPage] = useState(1);
  const PAGE_SIZE = 6;

  const [opponentCard, setOpponentCard] = useState<UserCard | null>(null);
  const [opponentName, setOpponentName] = useState<string>("");
  const [opponentImage, setOpponentImage] = useState<string>("/icono.png");

  useEffect(() => {
    // Use shared socket instance so navigation between routes doesn't disconnect the user.
    const s = initSocket() as Socket | null;
    if (!s) return;

    setSocket(s);

    // join room only once per mount
    s.emit("joinRoom", roomCode);

    const onReceiveMessage = (data: any) => setMessages((prev) => [...prev, data]);
    const onCardSelected = (data: any) => {
      setOpponentCard(data.card);
      setOpponentName(data.user);
    };
    const onUserJoined = (data: any) => {
      if (data.user !== username) setOpponentName(data.user);
    };
    const onRoomUsers = async (data: any) => {
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
    };

    s.on("receiveMessage", onReceiveMessage);
    s.on("cardSelected", onCardSelected);
    s.on("userJoined", onUserJoined);
    s.on("roomUsers", onRoomUsers);

    return () => {
      // remove listeners but do not disconnect shared socket on navigation
      s.off("receiveMessage", onReceiveMessage);
      s.off("cardSelected", onCardSelected);
      s.off("userJoined", onUserJoined);
      s.off("roomUsers", onRoomUsers);
      setSocket(null);
    };
  }, [username, roomCode]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/usercards/${username}/collection?forTrade=true`
        );
        const data = await res.json();

        // normalize card shapes to { id, name, image, rarity }
        const normalized = (data.cards || []).map((item: any) => {
          // item may have .cardId populated or may only have pokemonTcgId
          const card = item.cardId || {};

          // try multiple image shapes
          let image = card.imageUrl || card.imageUrlHiRes || card.image || '';
          if (!image && card.images) {
            image = card.images.large || card.images.small || '';
          }

          // fallback to constructing tcgdex asset from pokemonTcgId
          const tcgId = item.pokemonTcgId || card.pokemonTcgId || '';
          if (!image && tcgId) {
            const [setCode, number] = tcgId.split('-');
            const m = setCode ? String(setCode).match(/^[a-zA-Z]+/) : null;
            const series = m ? m[0] : (setCode ? setCode.slice(0,2) : '');
            if (setCode && number) image = `https://assets.tcgdex.net/en/${series}/${setCode}/${number}/high.png`;
          }

          return {
            id: item._id || (card._id || card.id) || tcgId || '' ,
            name: card.name || item.name || '',
            image,
            rarity: card.rarity || item.rarity || ''
          } as UserCard;
        });

        setUserCards(normalized);
      } catch {
        setUserCards([]);
      }
    };

    if (username) fetchCards();
  }, [username]);

  // keep current page within bounds when userCards changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(userCards.length / PAGE_SIZE));
    setCardsPage((p) => Math.min(p, totalPages));
  }, [userCards.length]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;

    const message = {
      text: input,
      roomCode,
      user: username,
    };

    socket.emit("sendMessage", message);

    setMessages((prev) => [...prev, message]);
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
            <h2 className="trade-title">{t("tradeRoom.titulo")}</h2>
            <p className="trade-room-code">
              {t("tradeRoom.codigoSala")} <b>{roomCode}</b>
            </p>

            <div className="trade-fight">
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

            {(() => {
              const totalPages = Math.max(1, Math.ceil(userCards.length / PAGE_SIZE));
              const page = Math.min(Math.max(1, cardsPage), totalPages);
              const pageItems = userCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
              return (
                <>
                  <div className="trade-cards-grid">
                    <div className="trade-cards-inner">
                      {pageItems.map((card) => (
                        <div
                          key={card.id}
                          className="trade-card"
                          onClick={() => handleSelectCard(card)}
                        >
                          <img src={card.image} className="trade-card-img" />
                          {/* intentionally hide name/title for trade browsing */}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="trade-pager" style={{ marginTop: 12 }}>
                    <button className="pager-btn" onClick={() => setCardsPage(p => Math.max(1, p - 1))} disabled={page <= 1}>&lt;</button>
                    <span className="pager-info">{page} / {totalPages}</span>
                    <button className="pager-btn" onClick={() => setCardsPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>&gt;</button>
                  </div>
                </>
              );
            })()}
          </section>

          {/* CHAT */}
          <aside className="trade-chat">
            <h3 className="chat-title">{t("tradeRoom.chat")}</h3>

            <div className="chat-window">
              <div className="messages-list">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`chat-message-row ${
                      m.user === username ? "self" : "other"
                    }`}
                  >
                    <div
                      className={`chat-bubble-2 ${
                        m.user === username ? "self" : "other"
                      }`}
                    >
                      {m.user !== username && (
                        <p className="sender-name">
                          {opponentName || t("tradeRoom.otroUsuario")}
                        </p>
                      )}
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chat-input-row">
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
