import React, { useEffect, useState, useMemo } from 'react';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer';
import { authService } from '../services/authService';
import { authenticatedFetch } from '../utils/fetchHelpers';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/request.css';

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

interface TradeRequest {
  _id: string;
  from: TradeUser;
  to: TradeUser;
  pokemonTcgId: string | null;
  cardName?: string;
  cardImage?: string;
  note?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  tradeId?: TradeRef | null;
  isManual?: boolean;
}

type Direction = 'received' | 'sent';

const TradeRequestsPage: React.FC = () => {
  const { t } = useTranslation();

  const [user, setUser] = useState<any>(authService.getUser());
  const [receivedRequests, setReceivedRequests] = useState<TradeRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const navigate = useNavigate();

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
            t('tradeReq.errorReceived', 'Error loading received requests.')
        );
      }
      if (!sentResp.ok) {
        const data = await sentResp.json().catch(() => ({}));
        throw new Error(
          data.error || t('tradeReq.errorSent', 'Error loading sent requests.')
        );
      }

      const recData = await recResp.json();
      const sentData = await sentResp.json();

      setReceivedRequests(recData.requests || []);
      setSentRequests(sentData.requests || []);
    } catch (e: any) {
      setError(
        e.message ||
          t(
            'tradeReq.errorGeneral',
            'An error occurred while loading trade requests.'
          )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadRequests();
    }
  }, [userId]);

  const activeReceived = useMemo(
    () => receivedRequests.filter((r) => !isFinal(r)),
    [receivedRequests]
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
  const handleAccept = async (requestId: string) => {
    if (
      !confirm(
        t(
          'tradeReq.confirmAccept',
          'Are you sure you want to accept this request?'
        )
      )
    )
      return;

    try {
      const resp = await authenticatedFetch(
        `/trade-requests/${requestId}/accept`,
        {
          method: 'POST',
        }
      );

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) throw new Error(data.error || t('tradeReq.errorAccept'));

      if (data.privateRoomCode) {
        navigate(`/trade-room/${data.privateRoomCode}`);
      } else {
        alert(t('tradeReq.accepted', 'Request accepted successfully.'));
        await loadRequests();
      }
    } catch (e: any) {
      alert(e.message || t('tradeReq.errorAccept'));
    }
  };

  const handleReject = async (requestId: string) => {
    if (
      !confirm(
        t(
          'tradeReq.confirmReject',
          'Are you sure you want to reject this request?'
        )
      )
    )
      return;

    try {
      const resp = await authenticatedFetch(
        `/trade-requests/${requestId}/reject`,
        {
          method: 'POST',
        }
      );

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || t('tradeReq.errorReject'));

      alert(t('tradeReq.rejected', 'Request rejected.'));
      loadRequests();
    } catch (e: any) {
      alert(e.message || t('tradeReq.errorReject'));
    }
  };

  const handleCancel = async (requestId: string) => {
    if (
      !confirm(
        t(
          'tradeReq.confirmCancel',
          'Are you sure you want to cancel this request?'
        )
      )
    )
      return;

    try {
      const resp = await authenticatedFetch(
        `/trade-requests/${requestId}/cancel`,
        {
          method: 'DELETE',
        }
      );

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || t('tradeReq.errorCancel'));

      alert(t('tradeReq.cancelled', 'Request cancelled.'));
      loadRequests();
    } catch (e: any) {
      alert(e.message || t('tradeReq.errorCancel'));
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
          {t('tradeReq.pending')}
        </span>
      );
    if (status === 'accepted')
      return (
        <span className="status-badge status-accepted">
          {t('tradeReq.acceptedStatus')}
        </span>
      );
    if (status === 'rejected')
      return (
        <span className="status-badge status-rejected">
          {t('tradeReq.rejectedStatus')}
        </span>
      );
    if (status === 'cancelled')
      return (
        <span className="status-badge status-cancelled">
          {t('tradeReq.cancelledStatus')}
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
          {t('tradeReq.roomUnavailable')}
        </span>
      );
    }

    return (
      <button
        className="room-chip room-chip-active"
        onClick={() => goToRoomIfAvailable(req)}
      >
        {t('tradeReq.goRoom')}
      </button>
    );
  };
  return (
    <div className="trade-requests-container trade-requests-page">
      <Header />

      <main className="trade-requests-main">
        <div className="discover-header">
          <h1 className="trade-requests-title">{t('tradeReq.title')}</h1>
        </div>

        {loading && (
          <p className="trade-requests-loading">
            {t('tradeReq.loading', 'Loading trade requests...')}
          </p>
        )}

        {error && !loading && <p className="trade-requests-error">{error}</p>}

        {!loading && !error && (
          <div className="trade-requests-columns">
            <section className="trade-panel">
              <h2 className="trade-panel-title">
                {t('tradeReq.received', 'Received Requests')}
              </h2>

              {activeReceived.length === 0 ? (
                <p className="trade-empty">
                  {t('tradeReq.noReceived', 'No received requests.')}
                </p>
              ) : (
                <div className="trade-list">
                  {activeReceived.map((req) => (
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
                            {t('tradeReq.noImage')}
                          </div>
                        )}
                      </div>

                      <div className="trade-info">
                        <div className="trade-info-header">
                          <span className="trade-user">
                            {t('tradeReq.from')}{' '}
                            <strong>
                              @{req.from?.username || t('tradeReq.unknown')}
                            </strong>
                          </span>
                          {renderStatusBadge(req.status)}
                        </div>

                        <p className="trade-card-name">
                          {req.cardName ||
                            t('tradeReq.noName', 'No name available')}
                        </p>

                        {req.note && (
                          <p className="trade-note">
                            <span>{t('tradeReq.message', 'Message')}:</span>{' '}
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
                                className="btn-blue-small"
                                onClick={() => handleAccept(req._id)}
                              >
                                {t('tradeReq.accept')}
                              </button>
                              <button
                                className="btn-red-small"
                                onClick={() => handleReject(req._id)}
                              >
                                {t('tradeReq.reject')}
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
                {t('tradeReq.sent', 'Sent Requests')}
              </h2>

              {activeSent.length === 0 ? (
                <p className="trade-empty">
                  {t('tradeReq.noSent', 'No sent requests.')}
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
                            {t('tradeReq.noImage')}
                          </div>
                        )}
                      </div>

                      <div className="trade-info">
                        <div className="trade-info-header">
                          <span className="trade-user">
                            {t('tradeReq.to')}{' '}
                            <strong>
                              @{req.to?.username || t('tradeReq.unknown')}
                            </strong>
                          </span>
                          {renderStatusBadge(req.status)}
                        </div>

                        <p className="trade-card-name">
                          {req.cardName ||
                            t('tradeReq.noName', 'No name available')}
                        </p>

                        {req.note && (
                          <p className="trade-note">
                            <span>{t('tradeReq.message', 'Message')}:</span>{' '}
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
                              onClick={() => handleCancel(req._id)}
                            >
                              {t('tradeReq.cancel')}
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
                {t('tradeReq.history', 'History')}
              </h2>

              {historyCombined.length === 0 ? (
                <p className="trade-empty">
                  {t('tradeReq.noHistory', 'No trade history available.')}
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
                              {t('tradeReq.noImage')}
                            </div>
                          )}
                        </div>

                        <div className="trade-info">
                          <div className="trade-info-header">
                            <span className="trade-user">
                              {isReceived
                                ? t('tradeReq.from')
                                : t('tradeReq.to')}{' '}
                              <strong>
                                @
                                {isReceived
                                  ? req.from?.username || t('tradeReq.unknown')
                                  : req.to?.username || t('tradeReq.unknown')}
                              </strong>
                            </span>
                            {renderStatusBadge(req.status)}
                          </div>

                          <p className="trade-card-name">
                            {req.cardName ||
                              t('tradeReq.noName', 'No name available')}
                          </p>

                          {req.note && (
                            <p className="trade-note">
                              <span>{t('tradeReq.message', 'Message')}:</span>{' '}
                              {req.note}
                            </p>
                          )}

                          <p className="trade-date">
                            {formatDate(req.createdAt)}
                          </p>

                          <div className="trade-actions">
                            {req.tradeId?.status === 'completed' && (
                              <span className="history-chip">
                                {t('tradeReq.tradeDone', 'Trade completed')}
                              </span>
                            )}
                            {req.tradeId?.status === 'cancelled' && (
                              <span className="history-chip">
                                {t(
                                  'tradeReq.tradeCancelled',
                                  'Trade cancelled'
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
    </div>
  );
};

export default TradeRequestsPage;
