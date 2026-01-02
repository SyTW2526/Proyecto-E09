/**
 * @file socket.ts
 * @description Configuración de conexión a Socket.io para comunicación en tiempo real
 *
 * Gestiona:
 * - Inicialización de la conexión Socket.io
 * - Autenticación con JWT
 * - Acceso global a la instancia del socket
 *
 * @requires socket.io-client - Cliente de Socket.io
 * @module socket
 */

import { io } from 'socket.io-client';
import { API_BASE_URL } from './config/constants';
import { store } from '@/store/store';
import { addNotification } from '@/features/notifications/notificationsSlice';
import { toast } from '@/components/ToastManager';
import type { Notification } from '@/features/notifications/notificationsSlice';

/**
 * Instancia global de Socket.io
 * @type {Socket|null}
 */
let socket: any = null;

/**
 * Inicializa la conexión Socket.io con autenticación JWT
 * Se conecta a http://localhost:3000 usando WebSocket
 *
 * @function
 * @returns {Socket|null} Instancia del socket o null si no hay token
 * @throws {Error} Si hay problemas en la conexión
 *
 * @example
 * const socket = initSocket();
 * if (socket) {
 *   socket.on('connect', () => console.log('Conectado'));
 * }
 */
export function initSocket() {
  if (socket) return socket;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    /**
     * Socket.io se conecta con autenticación por JWT
     * El token se envía en el handshake
     * autoConnect: false para conectar manualmente
     */
    socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
      autoConnect: false, // No conectar automáticamente
    });
    
    /**
     * Evento de conexión exitosa
     * Se dispara cuando se establece la conexión con el servidor
     */
    socket.on('connect', () => {
      console.log('Socket conectado:', socket.id);
    });
    
    /*
   * Evento de nueva solicitud
   */
  socket.on('notification', (notification: Notification) => {
    console.log('Notificación:', notification);

    toast.push({
      title: notification.title,
      message: notification.message,
    });

    store.dispatch(addNotification(notification));
  });

  /**
     * Evento de desconexión
     * Se dispara cuando se pierde la conexión con el servidor
     */
    socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });
    
    /**
     * Evento de error de conexión
     * Se dispara cuando hay un error al conectar
     */
    socket.on('connect_error', (error: Error) => {
      console.warn('Error de conexión Socket.io:', error.message);
      // No lanzar el error, solo loguearlo
    });
    
    /**
     * Evento de error general
     * Se dispara cuando hay un error en el socket
     */
    socket.on('error', (error: Error) => {
      console.warn('Error en Socket.io:', error.message);
      // No lanzar el error, solo loguearlo
    });
    
    // Conectar manualmente
    socket.connect();
    
    return socket;
  } catch (error) {
    console.warn('No se pudo inicializar Socket.io:', error);
    return null;
  }
}

/**
 * Obtiene la instancia global del socket
 * Debe usarse después de initSocket()
 * 
 * @function
 * @returns {Socket|null} Instancia del socket o null si no está inicializado
 * 
 * @example
 * const socket = getSocket();
 * if (socket) {
   socket.emit('event', data);
 * }
 */
export function getSocket() {
  return socket;
}

/**
 * Desconecta el socket del servidor
 * Limpia la instancia global y cierra la conexión
 *
 * @function
 * @returns {void}
 *
 * @example
 * disconnectSocket();
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
