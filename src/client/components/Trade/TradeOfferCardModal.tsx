import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TradeOwnerSelect from './TradeOwnerSelect';
import '../../styles/trade_modals.css';

interface UserCard {
  id: string;
  name: string;
  image: string;
  rarity: string;
  pokemonTcgId?: string;
  price?: { low?: number; mid?: number; high?: number };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  cardImage: string;
  owners: { username: string; quantity: number }[];
  selectedOwner: string;
  onOwnerChange: (v: string) => void;
  myCards: UserCard[];
  selectedMyCard: UserCard | null;
  onSelectMyCard: (card: UserCard) => void;
  onSend: () => void;
}

const TradeOfferCardModal: React.FC<Props> = ({
  visible,
  onClose,
  cardImage,
  owners,
  selectedOwner,
  onOwnerChange,
  myCards,
  selectedMyCard,
  onSelectMyCard,
  onSend,
}) => {
  const { t } = useTranslation();

  const PAGE_SIZE = 9;
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (!visible) return;
    setPage(1);
  }, [visible, selectedOwner, myCards.length]);

  const ownerOptions = React.useMemo(() => {
    return owners.map((o) => ({
      value: o.username,
      label: o.quantity > 1 ? `@${o.username} · ${o.quantity} ${t('tradeOfferCardModal.unitsShort', 'uds')}` : `@${o.username}`,
    }));
  }, [owners, t]);

  const totalPages = React.useMemo(
    () => Math.max(1, Math.ceil(myCards.length / PAGE_SIZE)),
    [myCards.length]
  );

  const paginated = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return myCards.slice(start, start + PAGE_SIZE);
  }, [page, myCards]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  if (!visible) return null;

  return (
    <div className="tradeModalOverlay" onClick={onClose}>
      <div className="tradeModalCard tradeModalCard--wide" onClick={stop} role="dialog" aria-modal="true">
        <div className="tradeModalHeader">
          <div className="tradeModalTitleWrap">
            <h2 className="tradeModalTitle">{t('tradeOfferCardModal.title', 'Trade for a card')}</h2>
            <p className="tradeModalSubtitle">
              {t('tradeOfferCardModal.subtitle', 'Choose the user and pick one of your cards to offer.')}
            </p>
          </div>

          <button
            type="button"
            className="tradeModalCloseBtn"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
            title={t('common.close', 'Close')}
          >
            <X size={18} />
          </button>
        </div>

        <div className="tradeModalBody tradeModalBody--twoCol">
          <div className="tradeModalLeft">
            <img
              src={cardImage}
              alt={t('tradeOfferCardModal.targetCardAlt', 'Target card')}
              className="tradeModalCardImage"
            />
          </div>

          <div className="tradeModalRight">
            <label className="tradeModalLabel">{t('tradeOfferCardModal.selectUser', 'User you want to trade with')}</label>

            <TradeOwnerSelect
              value={selectedOwner}
              options={ownerOptions}
              onChange={onOwnerChange}
              placeholder={t('tradeOfferCardModal.selectUser', 'User you want to trade with')}
            />

            <label className="tradeModalLabel tradeModalLabel--spaced">
              {t('tradeOfferCardModal.selectYourCard', 'Select one of your cards to offer')}
            </label>

            <div className="tradeOfferGrid">
              {paginated.length === 0 ? (
                <div className="tradeModalEmpty">
                  {t('tradeOfferCardModal.noCards', 'You have no cards marked for trade.')}
                </div>
              ) : (
                paginated.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={'tradeOfferCard' + (selectedMyCard?.id === c.id ? ' isSelected' : '')}
                    onClick={() => onSelectMyCard(c)}
                    aria-label={t('tradeOfferCardModal.pickCardAria', 'Select this card')}
                    title={c.name || t('tradeOfferCardModal.cardNoName', 'Card')}
                  >
                    <img src={c.image} alt={c.name || 'card'} />
                  </button>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="tradePager">
                <button type="button" className="pagerBtn" onClick={goPrev} disabled={!canPrev}>
                  ‹
                </button>

                <span className="pagerInfo">
                  {t('tradeOfferCardModal.page', 'Page')} {page} / {totalPages}
                </span>

                <button type="button" className="pagerBtn" onClick={goNext} disabled={!canNext}>
                  ›
                </button>
              </div>
            )}

            <div className="tradeModalActions">
              <button type="button" className="modalBtn modalBtn--primary" disabled={!selectedMyCard} onClick={onSend}>
                {t('tradeOfferCardModal.send', 'Send offer')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeOfferCardModal;
