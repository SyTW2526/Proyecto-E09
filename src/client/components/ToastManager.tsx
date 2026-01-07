/**
 * @file ToastManager.tsx
 * @description Gestor de notificaciones tipo toast (mensajes flotantes)
 *
 * Componente que renderiza notificaciones emergentes en la esquina de la pantalla.
 * Maneja el ciclo de vida de los toasts (aparición, 4 segundos, desaparición).
 *
 * **Características principales:**
 * - Exporta función `toast.push()` para mostrar toasts desde cualquier lugar
 * - Auto-dismiss después de 4 segundos
 * - Cada toast tiene ID único (UUID)
 * - Renderiza múltiples toasts simultáneamente
 * - IDs generados con crypto.randomUUID()
 * - Remover de lista al expirar
 * - Estilos en toast.css
 *
 * **Estructura de Toast:**
 * - id: UUID generado automáticamente
 * - title: Título corto (ej: "Éxito", "Error")
 * - message: Mensaje principal
 *
 * **Uso:**
 * ```typescript
 * import { toast } from './components/ToastManager'
 *
 * // Mostrar notificación
 * toast.push({
 *   title: 'Éxito',
 *   message: 'Perfil actualizado'
 * })
 * ```
 *
 * **Ciclo de vida:**
 * 1. toast.push() llamado
 * 2. Toast se añade a state (con UUID)
 * 3. Se renderiza inmediatamente
 * 4. setTimeout de 4 segundos
 * 5. Se remueve del state
 * 6. Fade out (CSS animation)
 *
 * **Estados:**
 * - toasts: Array de toasts visibles
 * - Cada toast contiene: id, title, message
 *
 * **Integración:**
 * - Montado en App.tsx/Root layout
 * - Accesible globalmente importando `toast`
 * - Usado en: apiService errors, operaciones exitosas, validaciones
 * - Redux notifications usa otro sistema (notificationsSlice)
 * - Este es para notificaciones rápidas/efímeras
 *
 * **Estilos:**
 * - app-toast-container: Contenedor fixed (esquina)
 * - app-toast: Cada notificación individual
 * - Animación de entrada/salida en CSS
 * - Responsive en mobile/desktop
 *
 * **Patrones de uso:**
 * - Errores de API
 * - Confirmaciones de acciones
 * - Validaciones de formulario
 * - Mensajes del sistema
 * - Cambios de preferencias
 *
 * **Diferencia con Redux notifications:**
 * - ToastManager: Rápido, efímero, 4 segundos auto-close
 * - Redux notificationsSlice: Persistente, listable, con mark as read
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires ../styles/toast.css
 * @module client/components/ToastManager
 * @exports toast - Objeto con función push() para mostrar toasts
 * @see App.tsx
 */

import { useState } from 'react';
import '../styles/toast.css';

export interface ToastPayload {
  title: string;
  message: string;
}

let pushToastExternal: (t: ToastPayload) => void;

export const toast = {
  push: (toast: ToastPayload) => {
    pushToastExternal?.(toast);
  },
};

const ToastManager = () => {
  const [toasts, setToasts] = useState<any[]>([]);

  pushToastExternal = (toast) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { ...toast, id }]);

    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  };

  return (
    <div className="app-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className="app-toast">
          <h4>{t.title}</h4>
          <p>{t.message}</p>
        </div>
      ))}
    </div>
  );
};

export default ToastManager;
