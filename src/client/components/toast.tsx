/**
 * @file toast.tsx
 * @description Componente ToastContainer - Renderizador de notificaciones tipo toast
 *
 * Componente que escucha eventos personalizados 'toast' y renderiza notificaciones
 * emergentes. Similar a ToastManager.tsx pero basado en eventos custom en lugar de
 * referencias globales.
 *
 * **Características principales:**
 * - Escucha eventos 'toast' en window
 * - Auto-dismiss después de 4 segundos
 * - Renderiza múltiples toasts en cola
 * - Toast removido de la pila (FIFO)
 * - Sin estado Redux (event-based)
 * - Estilos centralizados en toast.css
 *
 * **Estructura de Toast:**
 * - title: Título corto
 * - message: Mensaje principal
 *
 * **Ciclo de vida:**
 * 1. Window dispara evento 'toast' (CustomEvent)
 * 2. Handler recibe detail (objeto Toast)
 * 3. Toast se añade al state (unshift/push)
 * 4. Renderiza inmediatamente
 * 5. setTimeout 4 segundos
 * 6. Toast removido del array (slice(1))
 *
 * **Uso:**
 * ```typescript
 * // Disparar toast desde cualquier lugar
 * const event = new CustomEvent('toast', {
 *   detail: {
 *     title: 'Éxito',
 *     message: 'Operación completada'
 *   }
 * });
 * window.dispatchEvent(event);
 * ```
 *
 * **Estados:**
 * - toasts: Array de notificaciones activas
 * - Cada toast contiene: title, message
 *
 * **Diferencia con ToastManager.tsx:**
 * - ToastManager: Usa referencia global (pushToastExternal)
 * - toast.tsx: Usa eventos CustomEvent en window
 * - Ambos tienen 4 segundos auto-dismiss
 * - Ambos sin persistencia/Redux
 *
 * **Eventualmente:**
 * - Una de las dos implementaciones podría ser la canónica
 * - Actualmente coexisten (redundancia)
 * - Decidir cuál usar según preferencia de patrón
 *
 * **Integración:**
 * - Montado en App.tsx o layout raíz
 * - Listener global en window
 * - Cleanup en unmount
 * - Estilos: app-toast-container, app-toast
 *
 * **Accesibilidad:**
 * - Podría añadirse role="alert" a toasts
 * - aria-live="polite" en contenedor
 * - ARIA-atomic para actualización de contenido
 *
 * **Rendimiento:**
 * - O(1) append (push)
 * - O(n) slice (genera nuevo array)
 * - Alternativa: usar índice y filter
 * - Cleanup automático cada 4 segundos
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires ../styles/toast.css
 * @module client/components/toast
 * @see ToastManager.tsx
 * @see App.tsx
 */

import React, { useEffect, useState } from 'react';
import '../styles/toast.css';

interface Toast {
  title: string;
  message: string;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (event: any) => {
      const toast: Toast = event.detail;
      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 4000);
    };

    window.addEventListener('toast', handler);

    return () => window.removeEventListener('toast', handler);
  }, []);

  return (
    <div className="app-toast-container">
      {toasts.map((t, i) => (
        <div key={i} className="app-toast">
          <h4>{t.title}</h4>
          <p>{t.message}</p>
        </div>
      ))}
    </div>
  );
}
