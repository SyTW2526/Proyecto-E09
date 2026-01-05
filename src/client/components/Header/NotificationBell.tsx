/**
 * @file NotificationBell.tsx
 * @description Campana de notificaciones - Dropdown de notificaciones en tiempo real
 *
 * Componente de la barra superior que muestra todas las notificaciones del sistema.
 * Incluye badge con contador de no leídas, dropdown desplegable y marcar como leído.
 *
 * **Características principales:**
 * - Badge rojo con contador de notificaciones no leídas
 * - Animación de anillo cuando llega notificación nueva
 * - Dropdown con lista de todas las notificaciones
 * - Marcar individual o todas como leído
 * - Eliminar notificaciones del dropdown
 * - Máximo 9+ en el contador para no sobrecargar
 * - Click outside para cerrar dropdown
 *
 * **Tipos de notificaciones:**
 * - Trade aceptado/rechazado
 * - Nueva solicitud de amistad
 * - Amigo online/offline
 * - Mensaje en sala privada
 * - Sistema (mantenimiento, cambios)
 *
 * **Estados:**
 * - isOpen: Dropdown abierto/cerrado
 * - notifications: Array de todas las notificaciones
 * - unread: Contador de no leídas (calculado)
 *
 * **Animaciones:**
 * - Pulse en badge cuando hay no leídas
 * - Ring animation (anillo) cuando llega notificación nueva
 * - Fade out al eliminar notificación
 *
 * **Integración:**
 * - Redux notificationsSlice (markAsRead, markAllAsRead, removeNotification)
 * - i18next para traducciones
 * - Socket.io recibe eventos de notificación en tiempo real
 * - Dispatch automático al cambiar notificaciones
 *
 * **Interacción:**
 * - Click en campana: Abre/cierra dropdown
 * - Click fuera: Cierra dropdown
 * - Marca como leído: Oculta animación de no leído
 * - Eliminar: Quita de lista
 * - Mark all: Marca todas como leído de una vez
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @component
 * @requires react
 * @requires react-redux
 * @requires react-i18next
 * @requires lucide-react (Bell, X, CheckCheck icons)
 * @module client/components/Header/NotificationBell
 * @see Header.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/store';
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  Notification,
} from '../../features/notifications/notificationsSlice';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const unread = notifications.filter((n: Notification) => !n.isRead).length;

  useEffect(() => {
    if (unread > 0) {
      const bell = document.getElementById('bell-icon');
      if (bell) {
        bell.classList.add('ring');
        setTimeout(() => bell.classList.remove('ring'), 800);
      }
    }
  }, [unread]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleRemoveNotification = (notificationId: string) => {
    dispatch(removeNotification(notificationId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOTÓN CAMPANA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/20 rounded-full transition"
        aria-label={t('notifications.title', 'Notifications')}
      >
        <Bell
          id="bell-icon"
          className="w-6 h-6 sm:w-7 sm:h-7 text-white transition-all"
        />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="notification-dropdown absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-lg shadow-2xl z-[9999] border">
          {/* HEADER */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">
              {t('notifications.title', 'Notifications')}
            </h3>

            {unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                {t('notifications.markAll', 'Mark all as read')}
              </button>
            )}
          </div>

          {/* LISTA DE NOTIFICACIONES */}
          <div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('notifications.none', 'No notifications')}
                </p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <div
                  key={notification._id}
                  className={`border-b border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-start gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                          title={t('notifications.mark', 'Mark as read')}
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleRemoveNotification(notification._id)
                        }
                        className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-1"
                        title={t('common.delete', 'Delete')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
