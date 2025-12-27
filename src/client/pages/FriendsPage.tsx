import React, { useEffect, useRef, useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer';
import { initSocket } from '../socket';
import { authService } from '../services/authService';
import '../styles/friends.css';

interface User {
  id: string;
  username: string;
  profileImage?: string;
}

interface Friend {
  _id: string;
  username: string;
  profileImage?: string;
}

interface Request {
  userId: string;
  username: string;
  profileImage?: string;
}

interface SentRequest {
  _id: string;
  username: string;
  profileImage?: string;
}

interface Message {
  from: string;
  to: string;
  text: string;
  createdAt?: string;
}

const FriendsPage: React.FC = () => {
  const user = authService.getUser() as User | null;
  const token = localStorage.getItem('token');
  if (!user || !token) return null;

  const [view, setView] = useState<'chat' | 'requests'>('chat');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [received, setReceived] = useState<Request[]>([]);
  const [sent, setSent] = useState<SentRequest[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeFriend, setActiveFriend] = useState<Friend | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    action?: () => void;
  }>({
    visible: false,
    message: '',
  });

  const loadAll = async () => {
    const headers = { Authorization: `Bearer ${token}` };

    const [f, r, s] = await Promise.all([
      fetch(`http://localhost:3000/friends/user/${user.id}`, { headers }).then(
        (r) => r.json()
      ),
      fetch(`http://localhost:3000/friends/requests/user/${user.id}`, {
        headers,
      }).then((r) => r.json()),
      fetch(`http://localhost:3000/friends/requests/sent/${user.id}`, {
        headers,
      }).then((r) => r.json()),
    ]);

    setFriends(f.friends || []);
    setReceived(r.requests || []);
    setSent(s.sent || []);
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const s = initSocket();
    if (!s) return;

    setSocket(s);

    const onMessage = (msg: Message) => {
      if (
        activeFriend &&
        (msg.from === activeFriend._id || msg.to === activeFriend._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const onTyping = ({ from }: any) => {
      if (activeFriend && from === activeFriend._id) {
        setIsTyping(true);
      }
    };

    const onStopTyping = ({ from }: any) => {
      if (activeFriend && from === activeFriend._id) {
        setIsTyping(false);
      }
    };

    s.on('privateMessage', onMessage);
    s.on('typing', onTyping);
    s.on('stopTyping', onStopTyping);

    return () => {
      s.off('privateMessage', onMessage);
      s.off('typing', onTyping);
      s.off('stopTyping', onStopTyping);
    };
  }, [activeFriend?._id]);

  const openChat = async (friend: Friend) => {
    setActiveFriend(friend);
    setIsTyping(false);

    const r = await fetch(
      `http://localhost:3000/friends/messages/${friend._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await r.json();
    setMessages(data.messages || []);
  };

  const sendMessage = () => {
    if (!socket || !activeFriend || !messageInput.trim()) return;

    socket.emit('privateMessage', {
      from: user.id,
      to: activeFriend._id,
      text: messageInput,
    });

    socket.emit('stopTyping', { to: activeFriend._id });
    setMessageInput('');
  };

  const accept = async (id: string) => {
    await fetch(`http://localhost:3000/friends/accept/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAll();
  };

  const reject = async (id: string) => {
    await fetch(`http://localhost:3000/friends/reject/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAll();
  };

  const cancel = async (id: string) => {
    await fetch(`http://localhost:3000/friends/requests/cancel/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAll();
  };

  const sendFriendRequest = async (id: string) => {
    await fetch(`http://localhost:3000/friends/request/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadAll();
  };

  const showConfirmToast = (message: string, onConfirm: () => void) => {
    setToast({
      visible: true,
      message,
      action: onConfirm,
    });
  };

  const removeFriend = (friend: Friend) => {
    showConfirmToast(
      `¿Eliminar a ${friend.username} de tus amigos?`,
      async () => {
        await fetch(`http://localhost:3000/friends/remove/${friend._id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setToast({ visible: false, message: '' });
        setActiveFriend(null);
        setMessages([]);
        loadAll();
      }
    );
  };

  const handleSearch = async () => {
    if (!search.trim()) return;

    const r = await fetch(`http://localhost:3000/users/search/${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSearchResults(await r.json());
  };

  return (
    <div className="friendsPage">
      <Header />

      <main className="friendsMain">
        <h1 className="friendsTitle">Amigos</h1>

        <div className="friendsTabs">
          <button
            className={view === 'chat' ? 'isActive' : ''}
            onClick={() => setView('chat')}
          >
            Mis amigos
          </button>
          <button
            className={view === 'requests' ? 'isActive' : ''}
            onClick={() => setView('requests')}
          >
            Solicitudes
          </button>
        </div>

        {view === 'requests' && (
          <div className="trade-requests-container">
            <div className="trade-requests-main">
              <div className="trade-requests-columns">
                <section className="trade-panel">
                  <h3 className="trade-panel-title">Buscar usuarios</h3>

                  <input
                    className="discover-search-input"
                    placeholder="Buscar usuarios…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <button className="btn-blue-small" onClick={handleSearch}>
                    Buscar
                  </button>

                  {searchResults.length === 0 ? null : (
                    <div className="trade-list">
                      {searchResults.map((u) => (
                        <div key={u._id} className="friendUserRow">
                          <div className="friendUserInfo">
                            <img
                              src={u.profileImage || '/icono.png'}
                              alt={u.username}
                              className="friendUserAvatar"
                            />
                            <span className="friendUserName">{u.username}</span>
                          </div>

                          <div className="friendUserActions">
                            <button
                              className="btn-accent-small"
                              onClick={() => sendFriendRequest(u._id)}
                            >
                              Añadir amigo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="trade-panel">
                  <h3 className="trade-panel-title">Recibidas</h3>

                  {received.length === 0 ? (
                    <div className="trade-empty">No tienes solicitudes</div>
                  ) : (
                    <div className="trade-list">
                      {received.map((r) => (
                        <div key={r.userId} className="friendUserRow">
                          <div className="friendUserInfo">
                            <img
                              src={r.profileImage || '/icono.png'}
                              alt={r.username}
                              className="friendUserAvatar"
                            />
                            <span className="friendUserName">{r.username}</span>
                          </div>

                          <div className="friendUserActions">
                            <button
                              className="btn-blue-small"
                              onClick={() => accept(r.userId)}
                            >
                              Aceptar
                            </button>
                            <button
                              className="btn-red-small"
                              onClick={() => reject(r.userId)}
                            >
                              Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="trade-panel">
                  <h3 className="trade-panel-title">Enviadas</h3>

                  {sent.length === 0 ? (
                    <div className="trade-empty">
                      No has enviado solicitudes
                    </div>
                  ) : (
                    <div className="trade-list">
                      {sent.map((r) => (
                        <div key={r._id} className="friendUserRow">
                          <div className="friendUserInfo">
                            <img
                              src={r.profileImage || '/icono.png'}
                              alt={r.username}
                              className="friendUserAvatar"
                            />
                            <span className="friendUserName">{r.username}</span>
                          </div>

                          <div className="friendUserActions">
                            <button
                              className="btn-gray-small"
                              onClick={() => cancel(r._id)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}

        {view === 'chat' && (
          <div className="friendsChatLayout">
            <aside className="friendsList">
              <h3>MIS AMIGOS</h3>
              {friends.map((f) => (
                <div
                  key={f._id}
                  className={`friendRow ${activeFriend?._id === f._id ? 'active' : ''}`}
                  onClick={() => openChat(f)}
                >
                  <img src={f.profileImage || '/icono.png'} />
                  <span>{f.username}</span>

                  <button
                    className="removeFriendBtn"
                    title="Eliminar amigo"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFriend(f);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </aside>

            <section className="friendsChat">
              {!activeFriend ? (
                <div className="chatEmpty">Selecciona un amigo</div>
              ) : (
                <>
                  <header className="chatHeader">
                    <strong>{activeFriend.username}</strong>
                  </header>

                  <div className="chatMessages">
                    {messages.map((m, i) => (
                      <div
                        key={i}
                        className={`chatBubble ${m.from === user.id ? 'self' : 'other'}`}
                      >
                        {m.text}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="chatBubble other typingBubble">
                        <span className="typingDot">.</span>
                        <span className="typingDot">.</span>
                        <span className="typingDot">.</span>
                      </div>
                    )}
                  </div>

                  <div className="chatComposer">
                    <textarea
                      placeholder="Escribe un mensaje..."
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        socket?.emit('typing', { to: activeFriend._id });
                        clearTimeout((window as any)._typingTimeout);
                        (window as any)._typingTimeout = setTimeout(() => {
                          socket?.emit('stopTyping', { to: activeFriend._id });
                        }, 700);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                    >
                      Enviar
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
      {toast.visible && (
        <div className="toastOverlay">
          <div className="toastBox">
            <p>{toast.message}</p>

            <div className="toastActions">
              <button
                className="toastCancel"
                onClick={() => setToast({ visible: false, message: '' })}
              >
                Cancelar
              </button>

              <button className="toastConfirm" onClick={toast.action}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
