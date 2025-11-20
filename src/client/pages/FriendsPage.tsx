import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import "../styles/friends.css";
import { authService } from "../services/authService";

const FriendsPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token") || "";
  const userId = user?.id;

  useEffect(() => {
    const u = authService.getUser();
    setUser(u);

    const storedToken = localStorage.getItem("token") || "";
    if (!storedToken) return;

    const newSocket = io("http://localhost:3000", {
      auth: { token: storedToken },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const storedToken = localStorage.getItem("token") || "";

    const fetchData = async () => {
      try {
        const r1 = await fetch(`http://localhost:3000/friends/user/${userId}`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });
        const friendsData = await r1.json();

        const r2 = await fetch(
          `http://localhost:3000/friends/requests/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );
        const reqData = await r2.json();

        setFriends(friendsData.friends || []);
        setFriendRequests(reqData.requests || []);
      } catch (err) {}
    };

    fetchData();
  }, [userId]);

  const reloadFriends = async () => {
    if (!userId) return;

    const storedToken = localStorage.getItem("token") || "";

    try {
      const r1 = await fetch(`http://localhost:3000/friends/user/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const friendsData = await r1.json();

      const r2 = await fetch(
        `http://localhost:3000/friends/requests/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );
      const reqData = await r2.json();

      setFriends(friendsData.friends || []);
      setFriendRequests(reqData.requests || []);
    } catch (err) {}
  };

  const loadChatHistory = async (friendId: string) => {
    try {
      const r = await fetch(
        `http://localhost:3000/friends/messages/${friendId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await r.json();
      setMessages(data.messages || []);
    } catch (err) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handler = (msg: any) => {
      if (
        selectedFriend &&
        (msg.from === selectedFriend._id || msg.to === selectedFriend._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("privateMessage", handler);
    return () => socket.off("privateMessage", handler);
  }, [socket, selectedFriend]);

  const handleSearch = async () => {
    if (!search.trim()) return;

    const r = await fetch(`http://localhost:3000/users/search/${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setSearchResults(await r.json());
  };

  const sendFriendRequest = async (friendId: string) => {
    await fetch(`http://localhost:3000/friends/request/${friendId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Solicitud enviada");
  };

  const acceptFriendRequest = async (otherUserId: string) => {
    await fetch(`http://localhost:3000/friends/accept/${otherUserId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await reloadFriends();
  };

  const rejectFriendRequest = async (otherUserId: string) => {
    await fetch(`http://localhost:3000/friends/reject/${otherUserId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    await reloadFriends();
  };

  const removeFriend = async (friendIdentifier: string) => {
    if (!confirm("¿Eliminar a este amigo?")) return;

    await fetch(
      `http://localhost:3000/friends/remove/${friendIdentifier}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await reloadFriends();
  };

  const sendPrivateMessage = () => {
    if (!selectedFriend || !message.trim() || !userId || !socket) return;

    const msg = { from: userId, to: selectedFriend._id, text: message };

    socket.emit("privateMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setMessage("");
  };

  const openChat = async (friend: any) => {
    setSelectedFriend(friend);
    await loadChatHistory(friend._id);
  };

  return (
    <div className="friends-container">
      <Header />

      <main className="friends-main">
        <h1 className="friends-title">Amigos</h1>

        <div className="friends-columns">
          <div className="col-left">
            <section className="friends-panel">
              <h2 className="panel-title">Solicitudes</h2>

              {friendRequests.length === 0 ? (
                <p className="no-requests">No tienes solicitudes.</p>
              ) : (
                friendRequests.map((req) => (
                  <div key={req.requestId} className="result-row">
                    <span>{req.username}</span>

                    <div className="request-actions">
                      <button
                        className="btn-blue-small"
                        onClick={() => acceptFriendRequest(req.userId)}
                      >
                        Aceptar
                      </button>

                      <button
                        className="btn-gray-small"
                        onClick={() => rejectFriendRequest(req.userId)}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="friends-panel">
              <h2 className="panel-title">Buscar usuarios</h2>

              <input
                className="input-box"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="btn-blue" onClick={handleSearch}>
                Buscar
              </button>

              <div className="results-list">
                {searchResults.map((u) => (
                  <div key={u._id} className="result-row">
                    <span>{u.username}</span>
                    <button
                      className="btn-blue-small"
                      onClick={() => sendFriendRequest(u._id)}
                    >
                      Añadir
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="col-center">
            <section className="friends-panel">
              <h2 className="panel-title">Mis amigos</h2>

              {friends.length === 0 ? (
                <p className="no-requests">No tienes amigos.</p>
              ) : (
                friends.map((friend) => (
                  <div key={friend._id} className="result-row">
                    <span>{friend.username}</span>

                    <div className="request-actions">
                      <button
                        className="btn-gray-small"
                        onClick={() => removeFriend(friend._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>

          <div className="col-right">
            <section className="friends-panel chat-panel">
              <h2 className="panel-title">Chat</h2>

              <div className="friends-list">
                {friends.map((friend) => (
                  <button
                    key={friend._id}
                    className={
                      selectedFriend?._id === friend._id
                        ? "friend-button active"
                        : "friend-button"
                    }
                    onClick={() => openChat(friend)}
                  >
                    {friend.username}
                  </button>
                ))}
              </div>

              <div className="chat-window">
                {!selectedFriend ? (
                  <p className="no-friend-selected">Selecciona un amigo</p>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`chat-message-row ${
                          msg.from === userId ? "self" : "other"
                        }`}
                      >
                        <div
                          className={`chat-bubble ${
                            msg.from === userId ? "self" : "other"
                          }`}
                        >
                          {msg.from !== userId && (
                            <p className="sender-name">
                              {selectedFriend.username}
                            </p>
                          )}
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedFriend && (
                <div className="chat-input-row">
                  <input
                    className="input-box"
                    placeholder="Escribe un mensaje..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />

                  <button className="btn-blue-small" onClick={sendPrivateMessage}>
                    Enviar
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FriendsPage;
