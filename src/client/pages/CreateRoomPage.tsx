/**
 * @file CreateRoomPage.tsx
 * @description Página de Creación de Salas - Trading privado con amigos
 *
 * Interfaz para crear salas de trading privado con amigos.
 * Experiencia interactiva y colaborativa de trading en tiempo real.
 *
 * Características:
 * - Seleccionar amigo para trading
 * - Interfaz tipo "mostrador" para intercambio
 * - Arrastrar/soltar cartas desde colección
 * - Visualizar oferta de ambos lados
 * - Cálculo automático de valor
 * - Recomendación de equidad
 * - Chat en vivo durante trading
 * - Sincronización en tiempo real (Socket.io)
 * - Confirmación bilateral antes de finalizar
 * - Historial de cambios en la sala
 *
 * Secciones:
 * - Selección de amigo (debe ser amigo confirmado)
 * - Mostrador lado izquierdo (tus cartas)
 * - Mostrador lado derecho (cartas del amigo)
 * - Cartas seleccionadas para ofertar
 * - Botones: Proponer, Cancelar, Confirmar
 * - Chat panel para comunicación
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires react
 * @requires react-redux
 * @requires ../services/apiService
 * @requires ../services/socketService
 * @module client/pages/CreateRoomPage
 */
import React, { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer';
import { authService } from '../services/authService';
import { authenticatedFetch } from '../utils/fetchHelpers';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoadingError } from '../hooks';
import '../styles/request.css';

/**
 * @brief Representa un usuario amigo.
 */
interface FriendUser {
  _id: string;
  username: string;
  email?: string;
  profileImage?: string;
}
/**
 * @brief Representa una invitación de intercambio entre amigos.
 */
interface InviteUser {
  _id: string;
  username: string;
  email?: string;
  profileImage?: string;
}
/**
 * @brief Representa una invitación de intercambio entre amigos.
 */
interface FriendInvite {
  _id: string;
  from?: InviteUser;
  to?: InviteUser;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: string;
  privateRoomCode?: string | null;
}
/**
 * @brief Página para crear salas de intercambio privadas con amigos.
 */
const CreateRoomPage: React.FC = () => {
  const { t } = useTranslation();
  // Estado del usuario actual
  const [user, setUser] = useState<any>(authService.getUser());
  // Estado de la lista de amigos
  const [friends, setFriends] = useState<FriendUser[]>([]);
  // Estado de las invitaciones recibidas
  const [receivedInvites, setReceivedInvites] = useState<FriendInvite[]>([]);
  // Estado de las invitaciones enviadas
  const [sentInvites, setSentInvites] = useState<FriendInvite[]>([]);
  // Estado del amigo seleccionado para invitar
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  // Estado del término de búsqueda para filtrar amigos
  const [search, setSearch] = useState<string>('');
  // Estados de carga y error
  const { loading, error, startLoading, stopLoading, handleError, clearError } =
    useLoadingError(true);
  // Estado para la acción de confirmación (aceptar/rechazar invitación)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'accept' | 'reject';
    inviteId: string;
  } | null>(null);
  // Estado para mostrar modales de información
  const [infoModal, setInfoModal] = useState<{
    titleKey: string;
    messageKey: string;
  } | null>(null);

  const userId = user?.id || user?._id;

  const navigate = useNavigate();
  // Cargar usuario al montar el componente
  useEffect(() => {
    if (!user) {
      const u = authService.getUser();
      setUser(u);
    }
  }, [user]);
  /**
   * @brief Función para cargar la lista de amigos
   */
  const loadFriends = async () => {
    try {
      const u = authService.getUser();
      const uid = u?.id;
      if (!uid) throw new Error(t('createRoom.errorLoadingFriends'));

      const resp = await authenticatedFetch(`/friends/user/${uid}`);
      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data?.error || t('createRoom.errorLoadingFriends'));
      }

      const list = data?.friends || data?.data?.friends || [];
      setFriends(Array.isArray(list) ? list : []);
    } catch (e: any) {
      handleError(e?.message || t('createRoom.errorLoadingFriends'));
      setFriends([]);
    }
  };
  /**
   * @brief Función para cargar las invitaciones de intercambio
   */
  const loadInvites = async () => {
    try {
      const resp = await authenticatedFetch('/friend-trade-rooms/invites');

      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data.error || t('createRoom.errorLoadingInvites'));

      setReceivedInvites(data.received || []);
      setSentInvites(data.sent || []);
    } catch {}
  };
  useEffect(() => {
    const loadAll = async () => {
      startLoading();
      clearError();
      await loadFriends();
      await loadInvites();
      stopLoading();
    };

    if (authService.isAuthenticated()) loadAll();
    else stopLoading();
  }, [userId]);
  /**
   * @brief Filtra la lista de amigos según el término de búsqueda
   */
  const filteredFriends = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return friends;
    return friends.filter((f) => f.username.toLowerCase().includes(term));
  }, [friends, search]);

  /**
   * @brief Maneja la selección de un amigo para invitar
   */
  const handleSelectFriend = (friendId: string) => {
    setSelectedFriendId((prev) => (prev === friendId ? null : friendId));
  };

  /**
   * @brief Maneja la creación de una invitación
   */
  const handleCreateInvite = async () => {
    if (!selectedFriendId) {
      setInfoModal({
        titleKey: 'createRoom.attentionTitle',
        messageKey: 'createRoom.mustSelectFriend',
      });

      return;
    }

    try {
      const resp = await authenticatedFetch('/friend-trade-rooms/invite', {
        method: 'POST',
        body: JSON.stringify({ friendId: selectedFriendId }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        if (
          data.error === 'INVITE_ALREADY_EXISTS' ||
          data.error === 'Ya tienes una invitación pendiente a este amigo'
        ) {
          setInfoModal({
            titleKey: 'createRoom.inviteExistsTitle',
            messageKey: 'createRoom.inviteExists',
          });
          return;
        }

        throw new Error(data.error || t('createRoom.errorSendingInvite'));
      }

      setInfoModal({
        titleKey: 'createRoom.inviteSentTitle',
        messageKey: 'createRoom.inviteSent',
      });

      setSelectedFriendId(null);
      await loadInvites();
    } catch (e: any) {
      setInfoModal({
        titleKey: 'common.error',
        messageKey: e.message || t('createRoom.errorSendingInvite'),
      });
    }
  };

  /**
   * @brief Maneja la aceptación de una invitación
   */
  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const resp = await authenticatedFetch(
        `/friend-trade-rooms/invites/${inviteId}/accept`,
        {
          method: 'POST',
        }
      );

      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data.error || t('createRoom.errorAcceptInvite'));

      const roomCode = data.privateRoomCode;
      if (roomCode) navigate(`/trade-room/${roomCode}`);
      else alert(t('createRoom.noRoomCode'));

      await loadInvites();
    } catch (e: any) {
      alert(e.message || t('createRoom.errorAcceptInvite'));
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const resp = await authenticatedFetch(
        `/friend-trade-rooms/invites/${inviteId}/reject`,
        {
          method: 'POST',
        }
      );

      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data.error || t('createRoom.errorRejectInvite'));

      await loadInvites();
    } catch (e: any) {
      alert(e.message || t('createRoom.errorRejectInvite'));
    }
  };

  /**
   * @brief Maneja la navegación a una sala de intercambio
   */
  const handleGoRoom = (roomCode?: string | null) => {
    if (!roomCode) return;
    navigate(`/trade-room/${roomCode}`);
  };

  /**
   * @brief Filtra las invitaciones recibidas en activas y de historial
   */
  const receivedActive = receivedInvites.filter(
    (i) => i.status === 'pending' || i.status === 'accepted'
  );
  const receivedHistory = receivedInvites.filter(
    (i) =>
      i.status === 'completed' ||
      i.status === 'cancelled' ||
      i.status === 'rejected'
  );
  /**
   * @brief Filtra las invitaciones enviadas en activas y de historial
   */
  const sentActive = sentInvites.filter(
    (i) => i.status === 'pending' || i.status === 'accepted'
  );
  const sentHistory = sentInvites.filter(
    (i) =>
      i.status === 'completed' ||
      i.status === 'cancelled' ||
      i.status === 'rejected'
  );

  if (!user || !authService.isAuthenticated()) {
    return (
      <div className="trade-requests-container">
        <Header />
        <main className="trade-requests-main">
          <p>{t('createRoom.mustLogin')}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="trade-requests-container">
      <Header />
      {/*  @brief Main de la página de creación de salas de intercambio */}
      <main className="trade-requests-main">
        <div className="discover-header">
          <h1 className="trade-requests-title">{t('createRoom.title')}</h1>
          <p className="trade-requests-subtitle">{t('createRoom.subtitle')}</p>
        </div>

        {loading && (
          <p className="trade-requests-loading">{t('createRoom.loading')}</p>
        )}
        {error && !loading && <p className="trade-requests-error">{error}</p>}

        {!loading && (
          <div className="trade-requests-columns">
            <section className="trade-panel">
              <h2 className="trade-panel-title">
                {t('createRoom.inviteFriend')}
              </h2>

              {friends.length === 0 ? (
                <p className="trade-empty">{t('createRoom.noFriends')}</p>
              ) : (
                <>
                  <input
                    type="text"
                    className="discover-search-input"
                    placeholder={t('createRoom.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <div className="friend-list">
                    {filteredFriends.map((friend) => {
                      const isSelected = selectedFriendId === friend._id;
                      const avatar =
                        friend.profileImage && friend.profileImage.trim() !== ''
                          ? friend.profileImage
                          : '/icono.png';

                      return (
                        <div
                          key={friend._id}
                          className={
                            'friend-row' +
                            (isSelected ? ' friend-row-selected' : '')
                          }
                          onClick={() => handleSelectFriend(friend._id)}
                        >
                          <div className="friend-avatar-wrapper">
                            <img src={avatar} className="friend-avatar" />
                          </div>

                          <div className="trade-info">
                            <span className="trade-user">
                              <strong>@{friend.username}</strong>
                            </span>
                            <p className="trade-note">
                              {t('createRoom.clickToSelect')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '12px' }}>
                    <button
                      className="btn-accent-small"
                      disabled={!selectedFriendId}
                      onClick={handleCreateInvite}
                    >
                      {t('createRoom.createRoomButton')}
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="trade-panel">
              <h2 className="trade-panel-title">
                {t('createRoom.receivedInvites')}
              </h2>

              {receivedActive.length === 0 ? (
                <p className="trade-empty">
                  {t('createRoom.noReceivedInvites')}
                </p>
              ) : (
                <div className="trade-list">
                  {receivedActive.map((inv) => {
                    const avatar =
                      inv.from?.profileImage &&
                      inv.from.profileImage.trim() !== ''
                        ? inv.from.profileImage
                        : '/icono.png';

                    const canGoRoom =
                      inv.status === 'accepted' && inv.privateRoomCode;

                    return (
                      <div key={inv._id} className="trade-row">
                        <div className="trade-card-preview">
                          <img src={avatar} className="friend-avatar" />
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {t('createRoom.from')}{' '}
                              <strong>@{inv.from?.username}</strong>
                            </span>

                            <span
                              className={`status-badge status-${inv.status}`}
                            >
                              {inv.status === 'pending' &&
                                t('createRoom.pending')}
                              {inv.status === 'accepted' &&
                                t('createRoom.accepted')}
                            </span>
                          </div>

                          <p className="trade-date">
                            {new Date(inv.createdAt).toLocaleString()}
                          </p>

                          <div className="trade-actions">
                            {inv.status === 'pending' && (
                              <>
                                <button
                                  className="btn-blue-small"
                                  onClick={() =>
                                    setConfirmAction({
                                      type: 'accept',
                                      inviteId: inv._id,
                                    })
                                  }
                                >
                                  {t('createRoom.accept')}
                                </button>
                                <button
                                  className="btn-red-small"
                                  onClick={() =>
                                    setConfirmAction({
                                      type: 'reject',
                                      inviteId: inv._id,
                                    })
                                  }
                                >
                                  {t('createRoom.reject')}
                                </button>
                              </>
                            )}

                            {inv.status === 'accepted' && (
                              <button
                                className={
                                  canGoRoom
                                    ? 'btn-accent-small'
                                    : 'room-chip room-chip-disabled'
                                }
                                onClick={() =>
                                  canGoRoom && handleGoRoom(inv.privateRoomCode)
                                }
                              >
                                {canGoRoom
                                  ? t('createRoom.goRoom')
                                  : t('createRoom.roomUnavailable')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="trade-panel">
              <h2 className="trade-panel-title">
                {t('createRoom.sentInvites')}
              </h2>

              {sentActive.length === 0 ? (
                <p className="trade-empty">{t('createRoom.noSentInvites')}</p>
              ) : (
                <div className="trade-list">
                  {sentActive.map((inv) => {
                    const avatar =
                      inv.to?.profileImage && inv.to.profileImage.trim() !== ''
                        ? inv.to.profileImage
                        : '/icono.png';

                    const canGoRoom =
                      inv.status === 'accepted' && inv.privateRoomCode;

                    return (
                      <div key={inv._id} className="trade-row">
                        <div className="trade-card-preview">
                          <img src={avatar} className="friend-avatar" />
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {t('createRoom.to')}{' '}
                              <strong>@{inv.to?.username}</strong>
                            </span>

                            <span
                              className={`status-badge status-${inv.status}`}
                            >
                              {inv.status === 'pending' &&
                                t('createRoom.pending')}
                              {inv.status === 'accepted' &&
                                t('createRoom.accepted')}
                            </span>
                          </div>

                          <p className="trade-date">
                            {new Date(inv.createdAt).toLocaleString()}
                          </p>

                          <div className="trade-actions">
                            {inv.status === 'accepted' && (
                              <button
                                className={
                                  canGoRoom
                                    ? 'btn-blue-small'
                                    : 'room-chip room-chip-disabled'
                                }
                                onClick={() =>
                                  canGoRoom && handleGoRoom(inv.privateRoomCode)
                                }
                              >
                                {canGoRoom
                                  ? t('createRoom.goRoom')
                                  : t('createRoom.roomUnavailable')}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="trade-panel">
              <h2 className="trade-panel-title">{t('createRoom.history')}</h2>

              {receivedHistory.length === 0 && sentHistory.length === 0 ? (
                <p className="trade-empty">{t('createRoom.emptyHistory')}</p>
              ) : (
                <div className="trade-list">
                  {receivedHistory.map((inv) => {
                    const avatar =
                      inv.from?.profileImage &&
                      inv.from.profileImage.trim() !== ''
                        ? inv.from.profileImage
                        : '/icono.png';

                    return (
                      <div key={inv._id + '-rec'} className="trade-row">
                        <div className="trade-card-preview">
                          <img src={avatar} className="friend-avatar" />
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {t('createRoom.from')}{' '}
                              <strong>@{inv.from?.username}</strong>
                            </span>

                            <span
                              className={`status-badge status-${inv.status}`}
                            >
                              {inv.status === 'rejected' &&
                                t('createRoom.rejectedStatus')}
                              {inv.status === 'cancelled' &&
                                t('createRoom.cancelledStatus')}
                              {inv.status === 'completed' &&
                                t('createRoom.completedStatus')}
                            </span>
                          </div>

                          <p className="trade-date">
                            {new Date(inv.createdAt).toLocaleString()}
                          </p>

                          <div className="trade-actions">
                            <span className="history-chip">
                              {inv.status === 'completed'
                                ? t('createRoom.tradeDone')
                                : t('createRoom.roomUnavailable')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {sentHistory.map((inv) => {
                    const avatar =
                      inv.to?.profileImage && inv.to.profileImage.trim() !== ''
                        ? inv.to.profileImage
                        : '/icono.png';

                    return (
                      <div key={inv._id + '-sent'} className="trade-row">
                        <div className="trade-card-preview">
                          <img src={avatar} className="friend-avatar" />
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {t('createRoom.to')}{' '}
                              <strong>@{inv.to?.username}</strong>
                            </span>

                            <span
                              className={`status-badge status-${inv.status}`}
                            >
                              {inv.status === 'rejected' &&
                                t('createRoom.rejectedStatus')}
                              {inv.status === 'cancelled' &&
                                t('createRoom.cancelledStatus')}
                              {inv.status === 'completed' &&
                                t('createRoom.completedStatus')}
                            </span>
                          </div>

                          <p className="trade-date">
                            {new Date(inv.createdAt).toLocaleString()}
                          </p>

                          <div className="trade-actions">
                            <span className="history-chip">
                              {inv.status === 'completed'
                                ? t('createRoom.tradeDone')
                                : t('createRoom.roomUnavailable')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer />
      {confirmAction && (
        <div className="confirm-overlay" onClick={() => setConfirmAction(null)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">
              {confirmAction.type === 'accept'
                ? t('createRoom.confirmAcceptTitle')
                : t('createRoom.confirmRejectTitle')}
            </h3>

            <p className="confirm-text">
              {confirmAction.type === 'accept'
                ? t('createRoom.confirmAccept')
                : t('createRoom.confirmReject')}
            </p>

            <div className="confirm-actions">
              <button
                className="confirm-btn cancel"
                onClick={() => setConfirmAction(null)}
              >
                {t('common.cancel')}
              </button>

              <button
                className={`confirm-btn ${
                  confirmAction.type === 'accept' ? 'primary' : 'neutral'
                }`}
                onClick={() => {
                  if (confirmAction.type === 'accept') {
                    handleAcceptInvite(confirmAction.inviteId);
                  } else {
                    handleRejectInvite(confirmAction.inviteId);
                  }
                  setConfirmAction(null);
                }}
              >
                {confirmAction.type === 'accept'
                  ? t('createRoom.accept')
                  : t('createRoom.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
      {infoModal && (
        <div className="confirm-overlay" onClick={() => setInfoModal(null)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-title">{t(infoModal.titleKey)}</h3>

            <p className="confirm-text">{t(infoModal.messageKey)}</p>

            <div className="confirm-actions">
              <button
                className="confirm-btn primary"
                onClick={() => setInfoModal(null)}
              >
                {t('createRoom.accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoomPage;
