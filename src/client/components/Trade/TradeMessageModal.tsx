/**
 * @file TradeMessageModal.tsx
 * @description Modal para enviar oferta de trading a otro usuario
 *
 * Modal que aparece cuando un usuario quiere enviar una propuesta de trading.
 * Muestra la carta a ofrecer, permite seleccionar el destinatario y escribir un mensaje.
 *
 * **Características principales:**
 * - Visualización de la carta a ofrecer (imagen grande)
 * - Selector de propietario/destinatario (dropdown)
 * - Muestra cantidad de copias disponibles del propietario
 * - Campo de texto libre para mensaje/nota
 * - Botón enviar solo habilitado si hay owner y nota
 * - Modal con overlay oscuro (click outside para cerrar)
 * - Cerrar con botón X o click en overlay
 *
 * **Flujo de interacción:**
 * 1. Usuario ve imagen de carta a ofrecer
 * 2. Selecciona a quién ofrecerla (owner/destinatario)
 * 3. Escribe mensaje con términos de la oferta
 * 4. Click Enviar → Propuesta se envía
 * 5. Modal se cierra
 *
 * **Props:**
 * - visible: Mostrar/ocultar modal
 * - onClose: Callback para cerrar
 * - onSend: Callback para enviar oferta
 * - cardImage: URL de imagen de la carta
 * - owners: Array de {username, quantity} propietarios disponibles
 * - selectedOwner: Owner actual seleccionado
 * - onOwnerChange: Callback cambio de owner
 * - note: Contenido del mensaje/oferta
 * - onNoteChange: Callback cambio de nota
 *
 * **Estados:**
 * - visible: Controlado desde padre (TradePage, DiscoverTradePage)
 * - selectedOwner: Username del destinatario
 * - note: Texto del mensaje
 * - canSend: Boolean derivado (ownerSelected && noteTrimmed.length > 0)
 *
 * **Validación:**
 * - Owner seleccionado: Requerido
 * - Nota no vacía: Requerido (min 1 char visible)
 * - Botón Enviar deshabilitado si falta alguno
 *
 * **Estilos:**
 * - tradeModalOverlay: Fondo oscuro semitransparente
 * - tradeModalCard: Centro, blanco, sombra, radio redondeado
 * - Layout: 2 columnas (imagen izq, formulario der)
 * - Responsive: Stack vertical en mobile
 *
 * **Integración:**
 * - Usado en: TradePage, DiscoverTradePage, CreateRoomPage
 * - TradeOwnerSelect: Dropdown de propietarios
 * - i18next para traducciones
 * - Lucide-react para icono X
 *
 * **Accesibilidad:**
 * - role="dialog" y aria-modal="true"
 * - aria-label en botón cerrar
 * - Click-outside handling (stopPropagation)
 * - Keyboard navigation en formulario
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires react-i18next
 * @requires lucide-react (X icon)
 * @requires ./TradeOwnerSelect
 * @requires ../../styles/trade_modals.css
 * @module client/components/Trade/TradeMessageModal
 * @see TradePage.tsx
 * @see DiscoverTradePage.tsx
 * @see CreateRoomPage.tsx
 * @see TradeOwnerSelect.tsx
 */

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
