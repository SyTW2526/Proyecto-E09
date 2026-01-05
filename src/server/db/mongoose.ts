/**
 * @file mongoose.ts
 * @description Configuración e inicialización de conexión a MongoDB
 *
 * Este archivo se ejecuta automáticamente al importarse y establece
 * la conexión a MongoDB usando Mongoose como ODM.
 *
 * Características:
 * - Conexión automática al iniciar servidor
 * - URL de conexión desde variable de entorno MONGODB_URL
 * - Logging de conexión exitosa
 * - Manejo básico de errores de conexión
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires dotenv (vía config)
 * @module server/db/mongoose
 */

import { connect } from 'mongoose';

/**
 * Conexión a MongoDB
 * URL obtenida de variable de entorno: MONGODB_URL
 * Se registran logs de éxito o error en la consola
 */
try {
  await connect(process.env.MONGODB_URL!);
  console.log('Connection to MongoDB server established');
} catch (error) {
  console.log(error);
}
