/**
 * @file TradeModeModal.tsx
 * @description Modal para seleccionar el tipo de trading (mensaje o carta)
 *
 * Modal que aparece cuando un usuario inicia un trading con otro.
 * Permite elegir entre enviar un mensaje de oferta o una carta directamente.
 *
 * **Características principales:**
 * - Dos opciones de trading: Mensaje vs. Carta
 * - Modal compacto con 2 botones grandes
 * - Overlay oscuro (click outside para cerrar)
 * - Cerrar con botón X
 * - Traducciones i18next
 * - Accesibilidad con aria attributes
 *
 * **Dos modos de trading:**
 * 1. Send Message: Usuario escribe propuesta personalizada
 *    → Abre TradeMessageModal
 *    → Permite mensaje libre y selección de cartas
 * 2. Send Card: Usuario envía cartas directamente
 *    → Abre TradeOfferCardModal
 *    → Selecciona cartas a intercambiar
 *
 * **Props:**
 * - visible: Mostrar/ocultar modal
 * - onClose: Callback para cerrar
 * - onSendMessage: Callback seleccionar modo mensaje
 * - onSendCard: Callback seleccionar modo carta
 *
 * **Flujo:**
 * 1. Usuario ve dos opciones
 * 2. Click en una opción → Callback ejecutado → Modal padre cambia
 * 3. Se abre TradeMessageModal o TradeOfferCardModal según selección
 *
 * **Estados:**
 * - visible: Controlado desde padre (DiscoverTradePage, etc.)
 * - Solo presentacional (sin estado interno)
 *
 * **Estilos:**
 * - tradeModeBtn: Botones grandes con estilos distintos
 * - tradeModeBtn--message: Estilo para opción mensaje
 * - tradeModeBtn--card: Estilo para opción carta
 * - Layout: Stack vertical (tradeModalBody--stack)
 * - Responsive y centered
 *
 * **Integración:**
 * - Usado en: TradePage, DiscoverTradePage
 * - Coordina apertura de otros modales
 * - i18next para textos
 * - Lucide-react para icono X
 *
 * **Accesibilidad:**
 * - role="dialog", aria-modal="true"
 * - aria-label en botón cerrar
 * - Keyboard accessible buttons
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires react-i18next
 * @requires lucide-react (X icon)
 * @requires ../../styles/trade_modals.css
 * @module client/components/Trade/TradeModeModal
 * @see TradePage.tsx
 * @see DiscoverTradePage.tsx
 * @see TradeMessageModal.tsx
 * @see TradeOfferCardModal.tsx
 */

import React from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../../styles/trade_modals.css';

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
              {t('tradeModeModal.title', 'Choose trade mode')}
            </h2>
            <p className="tradeModalSubtitle">
              {t(
                'tradeModeModal.subtitle',
                'How do you want to contact the user?'
              )}
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

        <div className="tradeModalBody tradeModalBody--stack">
          <button
            type="button"
            className="tradeModeBtn tradeModeBtn--message"
            onClick={onSendMessage}
          >
            {t('tradeModeModal.sendMessage', 'Send message')}
          </button>

          <button
            type="button"
            className="tradeModeBtn tradeModeBtn--card"
            onClick={onSendCard}
          >
            {t('tradeModeModal.sendCard', 'Send card')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModeModal;
