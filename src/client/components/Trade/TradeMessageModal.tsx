import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import TradeOwnerSelect from './TradeOwnerSelect';
import '../../styles/trade_modals.css';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSend: () => void;
  cardImage: string;
  owners: { username: string; quantity: number }[];
  selectedOwner: string;
  onOwnerChange: (u: string) => void;
  note: string;
  onNoteChange: (v: string) => void;
}

const TradeMessageModal: React.FC<Props> = ({
  visible,
  onClose,
  onSend,
  cardImage,
  owners,
  selectedOwner,
  onOwnerChange,
  note,
  onNoteChange,
}) => {
  const { t } = useTranslation();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const ownerOptions = useMemo(() => {
    return owners.map((o) => ({
      value: o.username,
      label:
        o.quantity > 1
          ? `@${o.username} · ${t('tradeModal.units', 'units')} x${o.quantity}`
          : `@${o.username}`,
    }));
  }, [owners, t]);

  const canSend = Boolean(selectedOwner) && note.trim().length > 0;

  if (!visible) return null;

  return (
    <div className="tradeModalOverlay" onClick={onClose}>
      <div
        className="tradeModalCard"
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
        <div className="tradeModalHeader">
          <div className="tradeModalTitleWrap">
            <h2 className="tradeModalTitle">
              {t('tradeModal.title', 'Send trade message')}
            </h2>
            <p className="tradeModalSubtitle">
              {t('tradeModal.subtitle', 'Choose a user and write your offer.')}
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

        <div className="tradeModalBody">
          <div className="tradeModalLeft">
            <div className="tradeModalImageWrap">
              <img
                src={cardImage}
                alt={t('tradeModal.cardAlt', 'Card')}
                className="tradeModalImage"
              />
            </div>
          </div>

          <div className="tradeModalRight">
            <label className="tradeModalLabel">
              {t('tradeModal.chooseUser', 'User you want to trade with')}
            </label>

            <TradeOwnerSelect
              value={selectedOwner}
              options={ownerOptions}
              onChange={onOwnerChange}
              placeholder={t(
                'tradeModal.chooseUser',
                'User you want to trade with'
              )}
            />

            <label className="tradeModalLabel">
              {t('tradeModal.offerLabel', 'Message / card you offer')}
            </label>

            <textarea
              className="tradeModalTextarea"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder={t(
                'tradeModal.offerPlaceholder',
                'Describe the card you offer or the trade terms…'
              )}
              rows={5}
            />

            <div className="tradeModalActions">
              <button
                type="button"
                className="btn-gray-small"
                onClick={onClose}
              >
                {t('common.close', 'Close')}
              </button>

              <button
                type="button"
                className="btn-blue-small"
                onClick={onSend}
                disabled={!canSend}
              >
                {t('tradeModal.sendRequest', 'Send request')}
              </button>
            </div>

            {!canSend && (
              <p className="tradeModalHint tradeModalHint--soft">
                {t(
                  'tradeModal.hintFill',
                  'Select a user and write a message to send the request.'
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeMessageModal;
