/**
 * @file ConfirmModal.tsx
 * @description Modal de confirmación con variantes de estado (éxito, error, info)
 *
 * Componente modal genérico para mostrar confirmaciones, errores o mensajes de info.
 * Puede tener uno o dos botones (Cancelar y/o Confirmar) dependiendo del contexto.
 *
 * **Características principales:**
 * - Tres variantes visuales: success, error, info
 * - Icono específico por variante (CheckCircle, XCircle, Info)
 * - Título y mensaje personalizables
 * - Botones configurables (Cancelar siempre, Confirmar opcional)
 * - Overlay oscuro (click outside no cierra, requiere botón)
 * - Animación de aparición suave
 * - Estilos en modal.css
 *
 * **Variantes:**
 * 1. success (CheckCircle verde):
 *    - Confirmación de acción exitosa
 *    - Ej: "Perfil actualizado"
 *    - Botones: Cancelar, Confirmar
 *
 * 2. error (XCircle rojo):
 *    - Notificación de error
 *    - Ej: "No se pudo guardar"
 *    - Botones: Solo Cancelar/Aceptar
 *
 * 3. info (Info azul):
 *    - Información general
 *    - Ej: "¿Deseas eliminar?"
 *    - Botones: Cancelar, Confirmar
 *
 * **Props:**
 * - open: Boolean para mostrar/ocultar
 * - title: Título del modal
 * - message: Texto del mensaje
 * - variant?: 'success' | 'error' | 'info' (default: 'info')
 * - onClose: Callback botón Cancelar
 * - onConfirm?: Callback botón Confirmar (opcional)
 *
 * **Comportamiento:**
 * - Si no hay onConfirm: Solo muestra botón Cancelar
 * - Si hay onConfirm: Muestra Cancelar + Confirmar
 * - Click Cancelar: Cierra modal
 * - Click Confirmar: Ejecuta onConfirm + cierra
 * - Click overlay: NO cierra (modal bloqueante)
 *
 * **Estados:**
 * - open: Controlado por padre
 * - Animación CSS al aparecer/desaparecer
 *
 * **Estilos:**
 * - modalOverlay: Fondo oscuro semitransparente
 * - modalCard: Centro, blanco, sombra, radio redondeado
 * - modal-[variant]: Estilo según tipo
 * - modalIcon: Icono grande y coloreado
 * - modalTitle: Fuente grande y bold
 * - modalMessage: Texto gris
 * - modalActions: Botones alineados
 * - modalBtn: Estilo botones
 * - modalBtn--primary: Color primario (azul/verde)
 * - modalBtn--secondary: Gris/neutral
 *
 * **Uso común:**
 * ```tsx
 * // Confirmación antes de eliminar
 * <ConfirmModal
 *   open={showConfirm}
 *   title="Eliminar?"
 *   message="Esta acción es irreversible"
 *   variant="error"
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={() => handleDelete()}
 * />
 *
 * // Solo notificación (sin confirmar)
 * <ConfirmModal
 *   open={showSuccess}
 *   title="¡Listo!"
 *   message="Tu perfil se actualizó"
 *   variant="success"
 *   onClose={() => setShowSuccess(false)}
 * />
 * ```
 *
 * **Integración:**
 * - Usado en: CollectionPage (delete), ProfilePage (save), Trade actions
 * - Lucide-react para iconos
 * - CSS en modal.css
 * - Sin dependencias de Redux/i18n (props controladas por padre)
 *
 * **Accesibilidad:**
 * - focus-trap en modal (opcionalmente)
 * - aria-modal="true" (podría añadirse)
 * - Semántica de botones clara
 * - Textos descriptivos
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires lucide-react (CheckCircle, XCircle, Info icons)
 * @requires ../styles/modal.css
 * @module client/components/ConfirmModal
 * @see CollectionPage.tsx
 * @see ProfilePage.tsx
 * @see TradePage.tsx
 */

import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import '../styles/modal.css';

type Variant = 'success' | 'error' | 'info';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
  onClose: () => void;
  onConfirm?: () => void;
}

const icons: Record<Variant, React.ReactNode> = {
  success: <CheckCircle size={42} />,
  error: <XCircle size={42} />,
  info: <Info size={42} />,
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  variant = 'info',
  onClose,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="modalOverlay">
      <div className={`modalCard modal-${variant}`}>
        <div className="modalIcon">{icons[variant]}</div>

        <h3 className="modalTitle">{title}</h3>
        <p className="modalMessage">{message}</p>

        <div className="modalActions">
          <button className="modalBtn modalBtn--secondary" onClick={onClose}>
            Cancelar
          </button>

          {onConfirm && (
            <button className="modalBtn modalBtn--primary" onClick={onConfirm}>
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
