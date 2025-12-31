import React from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import "../../styles/trade_modals.css";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSendMessage: () => void;
  onSendCard: () => void;
}

const TradeModeModal: React.FC<Props> = ({
  visible,
  onClose,
  onSendMessage,
  onSendCard,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="tradeModalOverlay" onClick={onClose}>
      <div
        className="tradeModalCard tradeModalCard--compact"
        onClick={stop}
        role="dialog"
        aria-modal="true"
      >
        <div className="tradeModalHeader">
          <div className="tradeModalTitleWrap">
            <h2 className="tradeModalTitle">
              {t("tradeModeModal.title", "Choose trade mode")}
            </h2>
            <p className="tradeModalSubtitle">
              {t(
                "tradeModeModal.subtitle",
                "How do you want to contact the user?"
              )}
            </p>
          </div>

          <button
            type="button"
            className="tradeModalCloseBtn"
            onClick={onClose}
            aria-label={t("common.close", "Close")}
            title={t("common.close", "Close")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="tradeModalBody tradeModalBody--stack">
          <button
            type="button"
            className="tradeModeBtn tradeModeBtn--message"
            onClick={onSendMessage}
          >
            {t("tradeModeModal.sendMessage", "Send message")}
          </button>

          <button
            type="button"
            className="tradeModeBtn tradeModeBtn--card"
            onClick={onSendCard}
          >
            {t("tradeModeModal.sendCard", "Send card")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModeModal;
