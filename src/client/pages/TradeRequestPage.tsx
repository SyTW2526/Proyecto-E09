import React, { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer';
import { authService } from '../services/authService';
import { authenticatedFetch } from '../utils/fetchHelpers';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/request.css';
import ConfirmModal from '@/components/ConfirmModal';

interface TradeUser {
  _id: string;
  username: string;
  email?: string;
  profileImage?: string;
}

interface TradeRef {
  _id: string;
  privateRoomCode?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
}

interface OfferedCard {
  pokemonTcgId?: string;
  cardName?: string;
  cardImage?: string;
}

interface TradeRequest {
  _id: string;
  from: TradeUser;
  to: TradeUser;

  pokemonTcgId: string | null;
  requestedPokemonTcgId?: string | null;

  cardName?: string;
  cardImage?: string;
  note?: string;

  offeredCard?: OfferedCard;
  targetPrice?: number | null;
  offeredPrice?: number | null;

  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  tradeId?: TradeRef | null;
  isManual?: boolean;
}

type Direction = 'received' | 'sent';

const TradeRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(authService.getUser());
  const [receivedRequests, setReceivedRequests] = useState<TradeRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    variant?: 'success' | 'error' | 'info';
  } | null>(null);

  const [actionModal, setActionModal] = useState<{
    type: 'accept' | 'reject' | 'cancel';
    requestId: string;
  } | null>(null);

  const userId = user?.id;

  useEffect(() => {
    if (!user) {
      const u = authService.getUser();
      setUser(u);
    }
  }, [user]);

  const isFinal = (req: TradeRequest): boolean => {
    if (req.status === 'rejected' || req.status === 'cancelled') return true;
    const tradeStatus = req.tradeId?.status;
    if (tradeStatus && tradeStatus !== 'pending') return true;
    return false;
  };

  const isQuickTrade = (req: TradeRequest) =>
    !!req.offeredCard?.pokemonTcgId || !!req.offeredCard?.cardImage;

  const loadRequests = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [recResp, sentResp] = await Promise.all([
        authenticatedFetch(`/trade-requests/received/${userId}`),
        authenticatedFetch(`/trade-requests/sent/${userId}`),
      ]);

      if (!recResp.ok) {
        const data = await recResp.json().catch(() => ({}));
        throw new Error(
          data.error ||
            t(
              'tradeReq.errorReceived',
              'Error al cargar las solicitudes recibidas.'
            )
        );
      }

      if (!sentResp.ok) {
        const data = await sentResp.json().catch(() => ({}));
        throw new Error(
          data.error ||
            t('tradeReq.errorSent', 'Error al cargar las solicitudes enviadas.')
        );
      }

      const recData = await recResp.json().catch(() => ({}));
      const sentData = await sentResp.json().catch(() => ({}));

      setReceivedRequests(recData.requests || []);
      setSentRequests(sentData.requests || []);
    } catch (e: any) {
      const msg =
        e.message ||
        t(
          'tradeReq.errorGeneral',
          'Ha ocurrido un error al cargar las solicitudes.'
        );

      setConfirmModal({
        title: t('common.error', 'Error'),
        message: msg,
        variant: 'error',
      });

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadRequests();
  }, [userId]);
  const [quickDecision, setQuickDecision] = useState<{
    requestId: string;
  } | null>(null);

  const activeReceived = useMemo(
    () => receivedRequests.filter((r) => !isFinal(r)),
    [receivedRequests]
  );

  const activeReceivedQuick = useMemo(
    () => activeReceived.filter(isQuickTrade),
    [activeReceived]
  );

  const activeReceivedNormal = useMemo(
    () => activeReceived.filter((r) => !isQuickTrade(r)),
    [activeReceived]
  );

  const activeSent = useMemo(
    () => sentRequests.filter((r) => !isFinal(r)),
    [sentRequests]
  );

  const historyCombined = useMemo(() => {
    const receivedHistory = receivedRequests
      .filter((r) => isFinal(r))
      .map((r) => ({ ...r, __direction: 'received' as Direction }));

    const sentHistory = sentRequests
      .filter((r) => isFinal(r))
      .map((r) => ({ ...r, __direction: 'sent' as Direction }));

    return [...receivedHistory, ...sentHistory].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [receivedRequests, sentRequests]);

  const executeAction = async () => {
    if (!actionModal) return;
    const { type, requestId } = actionModal;

    try {
      if (type === 'accept') await handleAccept(requestId);
      if (type === 'reject') await handleReject(requestId);
      if (type === 'cancel') await handleCancel(requestId);
    } finally {
      setActionModal(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const resp = await authenticatedFetch(
        `/trade-requests/${requestId}/accept`,
        { method: 'POST' }
      );

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(
          data.error ||
            t(
              'tradeReq.errorAccept',
              'Error al aceptar la solicitud de intercambio.'
            )
        );

      if (data.privateRoomCode) {
        navigate(`/trade-room/${data.privateRoomCode}`);
        return;
      }

      setConfirmModal({
        title: t('tradeReq.acceptedStatus', 'Aceptada'),
        message: t('tradeReq.accepted', 'Solicitud aceptada correctamente.'),
        variant: 'success',
      });

      await loadRequests();
    } catch (e: any) {
      setConfirmModal({
        title: t('common.error', 'Error'),
        message:
          e.message ||
          t(
            'tradeReq.errorAccept',
            'Error al aceptar la solicitud de intercambio.'
          ),
        variant: 'error',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const resp = await authenticatedFetch(
        `/trade-requests/${requestId}/reject`,
        { method: 'POST' }
      );

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(
          data.error ||
            t(
              'tradeReq.errorReject',
              'Error al rechazar la solicitud de intercambio.'
            )
        );

      setConfirmModal({
        title: t('tradeReq.rejectedStatus', 'Rechazada'),
        message: t('tradeReq.rejected', 'Solicitud rechazada.'),
        variant: 'success',
      });

      await loadRequests();
    } catch (e: any) {
      setConfirmModal({
        title: t('common.error', 'Error'),
        message:
          e.message ||
          t(
            'tradeReq.errorReject',
            'Error al rechazar la solicitud de intercambio.'
          ),
        variant: 'error',
      });
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const resp = await authenticatedFetch(
        `/trade-requests/${requestId}/cancel`,
        { method: 'DELETE' }
      );

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(
          data.error ||
            t(
              'tradeReq.errorCancel',
              'Error al cancelar la solicitud de intercambio.'
            )
        );

      setConfirmModal({
        title: t('tradeReq.cancelledStatus', 'Cancelada'),
        message: t('tradeReq.cancelled', 'Solicitud cancelada.'),
        variant: 'success',
      });

      await loadRequests();
    } catch (e: any) {
      setConfirmModal({
        title: t('common.error', 'Error'),
        message:
          e.message ||
          t(
            'tradeReq.errorCancel',
            'Error al cancelar la solicitud de intercambio.'
          ),
        variant: 'error',
      });
    }
  };

  const handleOpenRoom = async (requestId: string) => {
    try {
      let resp = await authenticatedFetch(
        `/trade-requests/${requestId}/open-room`,
        { method: 'POST' }
      );

      if (resp.status === 404) {
        resp = await authenticatedFetch(`/trade-requests/${requestId}/reject`, {
          method: 'POST',
          body: JSON.stringify({ createRoom: true }),
        });
      }

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok)
        throw new Error(
          data.error ||
            t(
              'tradeReq.errorOpenRoom',
              'Error al crear la sala de intercambio.'
            )
        );

      if (data.privateRoomCode) {
        navigate(`/trade-room/${data.privateRoomCode}`);
        return;
      }

      setConfirmModal({
        title: t('tradeReq.openRoomCreatedTitle', 'Sala creada'),
        message: t(
          'tradeReq.openRoomCreated',
          'Se ha creado una sala de intercambio.'
        ),
        variant: 'success',
      });

      await loadRequests();
    } catch (e: any) {
      setConfirmModal({
        title: t('common.error', 'Error'),
        message:
          e.message ||
          t('tradeReq.errorOpenRoom', 'Error al crear la sala de intercambio.'),
        variant: 'error',
      });
    }
  };

  const goToRoomIfAvailable = (req: TradeRequest) => {
    const roomCode = req.tradeId?.privateRoomCode;
    const tradeStatus = req.tradeId?.status;
    const canGo = roomCode && tradeStatus === 'pending';
    if (!canGo) return;
    navigate(`/trade-room/${roomCode}`);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  };

  const renderStatusBadge = (status: TradeRequest['status']) => {
    if (status === 'pending')
      return (
        <span className="status-badge status-pending">
          {t('tradeReq.pending', 'Pendiente')}
        </span>
      );
    if (status === 'accepted')
      return (
        <span className="status-badge status-accepted">
          {t('tradeReq.acceptedStatus', 'Aceptada')}
        </span>
      );
    if (status === 'rejected')
      return (
        <span className="status-badge status-rejected">
          {t('tradeReq.rejectedStatus', 'Rechazada')}
        </span>
      );
    if (status === 'cancelled')
      return (
        <span className="status-badge status-cancelled">
          {t('tradeReq.cancelledStatus', 'Cancelada')}
        </span>
      );
    return null;
  };
  const renderRoomChip = (req: TradeRequest) => {
    const roomCode = req.tradeId?.privateRoomCode;
    const tradeStatus = req.tradeId?.status;

    if (!roomCode) return null;

    if (tradeStatus !== 'pending') {
      return (
        <span className="room-chip room-chip-disabled">
          {t('tradeReq.roomUnavailable', 'Sala no disponible')}
        </span>
      );
    }

    return (
      <button
        className="btn-blue-small"
        onClick={() => goToRoomIfAvailable(req)}
      >
        {t('tradeReq.goRoom', 'Ir a sala')}
      </button>
    );
  };

  return (
    <div className="trade-requests-container trade-requests-page">
      <Header />

      <main className="trade-requests-main">
        <div className="discover-header">
          <h1 className="trade-requests-title">
            {t('tradeReq.title', 'Solicitudes de intercambio')}
          </h1>
        </div>

        {loading && (
          <p className="trade-requests-loading">
            {t('tradeReq.loading', 'Cargando solicitudes de intercambio...')}
          </p>
        )}

        {!loading && !error && (
          <div className="trade-requests-columns">
            <section className="trade-panel">
              <h2 className="trade-panel-title">
                {t('tradeReq.quickReceived', 'Intercambios rápidos')}
              </h2>

              {activeReceivedQuick.length === 0 ? (
                <p className="trade-empty">
                  {t(
                    'tradeReq.noQuickReceived',
                    'No tienes intercambios rápidos.'
                  )}
                </p>
              ) : (
                <div className="trade-list">
                  {activeReceivedQuick.map((req) => {
                    const target = req.cardImage;
                    const offered = req.offeredCard?.cardImage;

                    const targetP =
                      typeof req.targetPrice === 'number'
                        ? req.targetPrice
                        : null;
                    const offeredP =
                      typeof req.offeredPrice === 'number'
                        ? req.offeredPrice
                        : null;

                    const diffPct =
                      targetP && offeredP && targetP > 0
                        ? (Math.abs(offeredP - targetP) / targetP) * 100
                        : null;

                    return (
                      <div key={req._id} className="trade-row trade-row-quick">
                        <div className="trade-card-preview trade-card-preview--pair">
                          <div className="trade-card-mini">
                            {offered ? (
                              <img
                                src={offered}
                                alt={req.offeredCard?.cardName}
                              />
                            ) : (
                              <div className="trade-card-placeholder-mini">
                                ?
                              </div>
                            )}
                          </div>

                          <span className="trade-swap-icon">⇄</span>

                          <div className="trade-card-mini">
                            {target ? (
                              <img src={target} alt={req.cardName} />
                            ) : (
                              <div className="trade-card-placeholder-mini">
                                ?
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {t('tradeReq.from', 'De')}{' '}
                              <strong>
                                @
                                {req.from?.username ||
                                  t('tradeReq.unknown', 'desconocido')}
                              </strong>
                            </span>
                            {renderStatusBadge(req.status)}
                          </div>

                          <p className="trade-card-name">
                            <span className="quick-label">
                              {t('tradeReq.offers', 'Ofrece')}:
                            </span>{' '}
                            {req.offeredCard?.cardName ||
                              t('tradeReq.noName', 'Sin nombre')}
                            <br />
                            <span className="quick-label">
                              {t('tradeReq.for', 'Por')}:
                            </span>{' '}
                            {req.cardName || t('tradeReq.noName', 'Sin nombre')}
                          </p>

                          {(targetP !== null ||
                            offeredP !== null ||
                            diffPct !== null) && (
                            <p className="trade-quick-metrics">
                              {typeof offeredP === 'number' && (
                                <span>
                                  {t('tradeReq.offeredPrice', 'Ofrecida')}:{' '}
                                  {offeredP.toFixed(2)}€
                                </span>
                              )}
                              {typeof targetP === 'number' && (
                                <span>
                                  {t('tradeReq.targetPrice', 'Objetivo')}:{' '}
                                  {targetP.toFixed(2)}€
                                </span>
                              )}
                              {typeof diffPct === 'number' && (
                                <span>
                                  {t('tradeReq.diff', 'Diferencia')}:{' '}
                                  {diffPct.toFixed(1)}%
                                </span>
                              )}
                            </p>
                          )}

                          {req.note && (
                            <p className="trade-note">
                              <span>{t('tradeReq.message', 'Mensaje')}:</span>{' '}
                              {req.note}
                            </p>
                          )}

                          <p className="trade-date">
                            {formatDate(req.createdAt)}
                          </p>

                          <div className="trade-actions">
                            {req.status === 'pending' && (
                              <>
                                <button
                                  className="btn-green-small"
                                  onClick={() =>
                                    setActionModal({
                                      type: 'accept',
                                      requestId: req._id,
                                    })
                                  }
                                >
                                  {t('tradeReq.acceptQuick', 'Aceptar')}
                                </button>
                                <button
                                  className="btn-blue-small"
                                  onClick={() =>
                                    setQuickDecision({ requestId: req._id })
                                  }
                                >
                                  {t('tradeReq.quickDecision', 'Decidir')}
                                </button>
                              </>
                            )}
                            {req.tradeId?.privateRoomCode &&
                              renderRoomChip(req)}
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
                {t('tradeReq.received', 'Solicitudes recibidas')}
              </h2>

              {activeReceivedNormal.length === 0 ? (
                <p className="trade-empty">
                  {t('tradeReq.noReceived', 'No tienes solicitudes recibidas.')}
                </p>
              ) : (
                <div className="trade-list">
                  {activeReceivedNormal.map((req) => (
                    <div key={req._id} className="trade-row">
                      <div className="trade-card-preview">
                        {req.cardImage ? (
                          <img
                            src={req.cardImage}
                            alt={req.cardName}
                            className="trade-card-img"
                          />
                        ) : (
                          <div className="trade-card-placeholder">
                            {t('tradeReq.noImage', 'Sin imagen')}
                          </div>
                        )}
                      </div>

                      <div className="trade-info">
                        <div className="trade-info-header">
                          <span className="trade-user">
                            {t('tradeReq.from', 'De')}{' '}
                            <strong>
                              @
                              {req.from?.username ||
                                t('tradeReq.unknown', 'desconocido')}
                            </strong>
                          </span>
                          {renderStatusBadge(req.status)}
                        </div>

                        <p className="trade-card-name">
                          {req.cardName || t('tradeReq.noName', 'Sin nombre')}
                        </p>

                        {req.note && (
                          <p className="trade-note">
                            <span>{t('tradeReq.message', 'Mensaje')}:</span>{' '}
                            {req.note}
                          </p>
                        )}

                        <p className="trade-date">
                          {formatDate(req.createdAt)}
                        </p>

                        <div className="trade-actions">
                          {req.status === 'pending' && (
                            <>
                              <button
                                className="btn-green-small"
                                onClick={() =>
                                  setActionModal({
                                    type: 'accept',
                                    requestId: req._id,
                                  })
                                }
                              >
                                {t('tradeReq.accept', 'Aceptar')}
                              </button>
                              <button
                                className="btn-red-small"
                                onClick={() =>
                                  setActionModal({
                                    type: 'reject',
                                    requestId: req._id,
                                  })
                                }
                              >
                                {t('tradeReq.reject', 'Rechazar')}
                              </button>
                            </>
                          )}

                          {req.status === 'accepted' && renderRoomChip(req)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="trade-panel">
              <h2 className="trade-panel-title">
                {t('tradeReq.sent', 'Solicitudes enviadas')}
              </h2>

              {activeSent.length === 0 ? (
                <p className="trade-empty">
                  {t('tradeReq.noSent', 'No tienes solicitudes enviadas.')}
                </p>
              ) : (
                <div className="trade-list">
                  {activeSent.map((req) => (
                    <div key={req._id} className="trade-row">
                      <div className="trade-card-preview">
                        {req.cardImage ? (
                          <img
                            src={req.cardImage}
                            alt={req.cardName}
                            className="trade-card-img"
                          />
                        ) : (
                          <div className="trade-card-placeholder">
                            {t('tradeReq.noImage', 'Sin imagen')}
                          </div>
                        )}
                      </div>

                      <div className="trade-info">
                        <div className="trade-info-header">
                          <span className="trade-user">
                            {t('tradeReq.to', 'Para')}{' '}
                            <strong>
                              @
                              {req.to?.username ||
                                t('tradeReq.unknown', 'desconocido')}
                            </strong>
                          </span>
                          {renderStatusBadge(req.status)}
                        </div>

                        <p className="trade-card-name">
                          {req.cardName || t('tradeReq.noName', 'Sin nombre')}
                        </p>

                        {req.note && (
                          <p className="trade-note">
                            <span>{t('tradeReq.message', 'Mensaje')}:</span>{' '}
                            {req.note}
                          </p>
                        )}

                        <p className="trade-date">
                          {formatDate(req.createdAt)}
                        </p>

                        <div className="trade-actions">
                          {req.status === 'pending' && (
                            <button
                              className="btn-red-small"
                              onClick={() =>
                                setActionModal({
                                  type: 'cancel',
                                  requestId: req._id,
                                })
                              }
                            >
                              {t('tradeReq.cancel', 'Cancelar')}
                            </button>
                          )}

                          {req.status === 'accepted' && renderRoomChip(req)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="trade-panel trade-panel-history">
              <h2 className="trade-panel-title">
                {t('tradeReq.history', 'Historial')}
              </h2>

              {historyCombined.length === 0 ? (
                <p className="trade-empty">
                  {t('tradeReq.noHistory', 'No hay historial disponible.')}
                </p>
              ) : (
                <div className="trade-list">
                  {historyCombined.map((req: any) => {
                    const dir: Direction = req.__direction;
                    const isReceived = dir === 'received';

                    return (
                      <div key={req._id} className="trade-row">
                        <div className="trade-card-preview">
                          {req.cardImage ? (
                            <img
                              src={req.cardImage}
                              alt={req.cardName}
                              className="trade-card-img"
                            />
                          ) : (
                            <div className="trade-card-placeholder">
                              {t('tradeReq.noImage', 'Sin imagen')}
                            </div>
                          )}
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {isReceived
                                ? t('tradeReq.from', 'De')
                                : t('tradeReq.to', 'Para')}{' '}
                              <strong>
                                @
                                {isReceived
                                  ? req.from?.username ||
                                    t('tradeReq.unknown', 'desconocido')
                                  : req.to?.username ||
                                    t('tradeReq.unknown', 'desconocido')}
                              </strong>
                            </span>
                            {renderStatusBadge(req.status)}
                          </div>

                          <p className="trade-card-name">
                            {req.cardName || t('tradeReq.noName', 'Sin nombre')}
                          </p>

                          {req.note && (
                            <p className="trade-note">
                              <span>{t('tradeReq.message', 'Mensaje')}:</span>{' '}
                              {req.note}
                            </p>
                          )}

                          <p className="trade-date">
                            {formatDate(req.createdAt)}
                          </p>

                          <div className="trade-actions">
                            {req.tradeId?.status === 'completed' && (
                              <span className="history-chip">
                                {t(
                                  'tradeReq.tradeDone',
                                  'Intercambio completado'
                                )}
                              </span>
                            )}
                            {req.tradeId?.status === 'cancelled' && (
                              <span className="history-chip">
                                {t(
                                  'tradeReq.tradeCancelled',
                                  'Intercambio cancelado'
                                )}
                              </span>
                            )}
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

      {confirmModal && (
        <ConfirmModal
          open={true}
          title={confirmModal.title}
          message={confirmModal.message}
          variant={confirmModal.variant}
          onClose={() => setConfirmModal(null)}
        />
      )}

      {actionModal && (
        <ConfirmModal
          open={true}
          title={
            actionModal.type === 'accept'
              ? t('tradeReq.confirmAcceptTitle', 'Aceptar solicitud')
              : actionModal.type === 'reject'
                ? t('tradeReq.confirmRejectTitle', 'Rechazar solicitud')
                : t('tradeReq.confirmCancelTitle', 'Cancelar solicitud')
          }
          message={
            actionModal.type === 'accept'
              ? t(
                  'tradeReq.confirmAccept',
                  '¿Seguro que quieres aceptar esta solicitud de intercambio?'
                )
              : actionModal.type === 'reject'
                ? t(
                    'tradeReq.confirmReject',
                    '¿Seguro que quieres rechazar esta solicitud de intercambio?'
                  )
                : t(
                    'tradeReq.confirmCancel',
                    '¿Seguro que quieres cancelar esta solicitud de intercambio?'
                  )
          }
          variant={actionModal.type === 'accept' ? 'success' : 'error'}
          onConfirm={executeAction}
          onClose={() => setActionModal(null)}
        />
      )}
      {quickDecision && (
        <div className="modalOverlay" onClick={() => setQuickDecision(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <button
              className="modalClose"
              aria-label={t('common.close', 'Cerrar')}
              onClick={() => setQuickDecision(null)}
            >
              ×
            </button>

            <h3 className="modalTitle">
              {t('tradeReq.quickModalTitle', 'Intercambio rápido')}
            </h3>

            <p className="modalMessage">
              {t(
                'tradeReq.quickModalMessage',
                '¿Quieres rechazar o crear una sala para negociar?'
              )}
            </p>

            <div className="modalActions">
              <button
                className="btn-red-small"
                onClick={async () => {
                  const id = quickDecision.requestId;
                  setQuickDecision(null);
                  await handleReject(id);
                }}
              >
                {t('tradeReq.reject', 'Rechazar')}
              </button>

              <button
                className="btn-blue-small"
                onClick={async () => {
                  const id = quickDecision.requestId;
                  setQuickDecision(null);
                  await handleOpenRoom(id);
                }}
              >
                {t('tradeReq.openRoom', 'Crear sala')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeRequestsPage;
