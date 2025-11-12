import React, { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Footer from "@/components/Footer";

interface UserCard {
  id: number;
  name: string;
  image: string;
  rarity: string;
}

const TradeRoomPage: React.FC = () => {
  const [messages, setMessages] = useState([
    { user: "Pedro", text: "Te regalo la carta" },
    { user: "Tú", text: "Ohh!" },
    { user: "Pedro", text: "La tengo repetida" },
  ]);
  const [input, setInput] = useState("");
  const [userCards, setUserCards] = useState<UserCard[]>([]);

  useEffect(() => {
    setUserCards([
      { id: 1, name: "Pikachu", image: "/cards/card1.png", rarity: "Raro" },
      { id: 2, name: "Charmander", image: "/cards/card2.png", rarity: "Común" },
      { id: 3, name: "Bulbasaur", image: "/cards/card3.png", rarity: "Épico" },
      { id: 4, name: "Squirtle", image: "/cards/card4.png", rarity: "Común" },
      { id: 5, name: "Jigglypuff", image: "/cards/card5.png", rarity: "Raro" },
    ]);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { user: "Tú", text: input }]);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 to-sky-200 text-gray-900 overflow-hidden">
      {/* HEADER */}
      <Header />

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 w-full flex justify-center px-6 mt-6">
        <div className="w-full max-w-7xl bg-white rounded-2xl shadow-xl border border-sky-200 overflow-hidden flex flex-col">
          <div className="flex flex-col lg:flex-row flex-grow">
            {/* IZQUIERDA */}
            <section className="flex-1 p-8 bg-gradient-to-b from-white to-sky-50 flex flex-col justify-between">
              <div className="flex flex-col items-center">
                <h2 className="text-3xl font-bold text-sky-700 text-center mb-8">
                  SALA PRIVADA
                </h2>

                {/* JUGADORES */}
                <div className="flex flex-wrap justify-center items-start gap-24 mb-10">
                  {/* Tú */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-sky-300 rounded-full border-4 border-white shadow mb-2" />
                    <p className="font-bold text-sky-700">TÚ</p>
                    <p className="text-sm text-gray-500 mb-2">OFRECE</p>
                    <div className="w-36 h-52 bg-gray-50 border border-gray-300 rounded-xl shadow flex items-center justify-center mb-6">
                      <span className="text-gray-400 text-xs">Tu carta</span>
                    </div>

                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Tus cartas disponibles
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center">
                      {userCards.map((card) => (
                        <div
                          key={card.id}
                          className="bg-white rounded-lg border border-gray-300 shadow-sm p-2 w-24 hover:scale-105 transition"
                        >
                          <img
                            src={card.image}
                            alt={card.name}
                            className="rounded-md w-full h-28 object-cover mb-1"
                          />
                          <p className="text-center text-xs font-semibold text-gray-700 truncate">
                            {card.name}
                          </p>
                          <p className="text-center text-[10px] text-gray-500">
                            {card.rarity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pedro */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-300 rounded-full border-4 border-white shadow mb-2" />
                    <p className="font-bold text-blue-700">PEDRO</p>
                    <p className="text-sm text-gray-500 mb-2">OFRECE</p>
                    <div className="w-36 h-52 bg-gray-50 border border-gray-300 rounded-xl shadow flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Carta de Pedro</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTONES */}
              <div className="flex gap-6 justify-center pt-4 mt-4">

                <button className="bg-green-500 text-white font-semibold px-8 py-2 rounded-lg hover:bg-green-600 shadow">
                  ACEPTAR
                </button>
                <button className="bg-red-500 text-white font-semibold px-8 py-2 rounded-lg hover:bg-red-600 shadow">
                  RECHAZAR
                </button>
              </div>
            </section>

            {/* CHAT */}
            <aside className="w-full lg:w-96 bg-gradient-to-b from-sky-100 to-sky-200 border-t lg:border-t-0 lg:border-l border-gray-300 flex flex-col p-5">
              <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-400 pb-2">
                AMIGOS EN LA SALA
              </h3>
              <ul className="text-gray-700 text-sm mb-4">
                <li>• TÚ</li>
                <li>• PEDRO</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3 border-b border-gray-400 pb-2">
                CHAT
              </h3>
              <div className="flex-1 overflow-y-auto bg-white rounded-lg p-3 mb-4 shadow-inner border border-sky-100">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex mb-2 ${
                      m.user === "Tú" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm ${
                        m.user === "Tú"
                          ? "bg-sky-400 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p>{m.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-stretch border border-gray-400 rounded-lg overflow-hidden">
                <input
                  className="flex-1 p-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400"
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  onClick={handleSend}
                  className="bg-sky-500 text-white px-4 hover:bg-sky-600 transition flex items-center justify-center"
                >
                  ➤
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* FOOTER */}
<footer className="bg-black text-white text-center text-[11px] py-[2px] leading-snug">
  <Footer />
</footer>


    </div>
  );
};

export default TradeRoomPage;


