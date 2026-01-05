/**
 * @file EnergyCard.ts
 * @description Discriminador de Card para cartas de Energía
 *
 * Extiende el modelo base Card añadiendo campos específicos de cartas Energía:
 * - Tipo de energía (agua, fuego, planta, etc)
 * - Nombre de energía especial (si aplica)
 * - Texto de efecto especial
 *
 * Almacenamiento:
 * - Colección: 'cards'
 * - Discriminator: 'energy'
 * - Una sola colección para todos los tipos de cartas
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires ./Card
 * @module server/models/EnergyCard
 * @extends Card
 */

import mongoose from 'mongoose';
import { Card } from './Card.js';

/**
 * Esquema específico de Carta de Energía (solo campos únicos)
 *
 * Hereda todos los campos comunes de Card y añade solo los específicos.
 *
 * @typedef {Object} EnergyCardExtension
 * @property {string} subtype - Subtipo (Basic, Special)
 * @property {string} energyType - Tipo de energía (Fire, Water, Colorless, etc.)
 * @property {string} text - Descripción y reglas de la energía
 */
const energyCardSchema = new mongoose.Schema({
  subtype: { type: String },
  energyType: { type: String },
  text: { type: String },
});

/**
 * Modelo de Carta de Energía como discriminator de Card
 * Automáticamente hereda todos los campos de Card.
 *
 * category='energy' se establece automáticamente
 *
 * @type {mongoose.Model}
 */
export const EnergyCard = Card.discriminator('energy', energyCardSchema);
