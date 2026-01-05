/**
 * @file PokemonCard.ts
 * @description Discriminator de Card para cartas de Pokémon
 *
 * Extiende el modelo base Card añadiendo campos específicos de cartas Pokémon:
 * - HP (Puntos de Salud)
 * - Tipos de energía
 * - Ataques con costes y daño
 * - Habilidades especiales
 * - Debilidades, resistencias, costo de retirada
 * - Evoluciones y parentesco
 *
 * Almacenamiento:
 * - Colección: 'cards'
 * - Discriminator: 'pokemon'
 * - Una sola colección para todos los tipos de cartas
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @requires ./Card
 * @module server/models/PokemonCard
 * @extends Card
 */

import mongoose from 'mongoose';
import { Card } from './Card.js';

/**
 * Esquema de Ataque
 * @typedef {Object} Attack
 * @property {string} name - Nombre del ataque
 * @property {Array<string>} cost - Costo energético del ataque
 * @property {string} damage - Daño infligido
 * @property {string} text - Descripción del efecto
 */
const attackSchema = new mongoose.Schema(
  {
    name: String,
    cost: [String],
    damage: String,
    text: String,
  },
  { _id: false }
);

/**
 * Esquema de Habilidad
 * @typedef {Object} Ability
 * @property {string} name - Nombre de la habilidad
 * @property {string} text - Descripción de la habilidad
 * @property {string} type - Tipo de habilidad
 */
const abilitySchema = new mongoose.Schema(
  {
    name: String,
    text: String,
    type: String,
  },
  { _id: false }
);

/**
 * Esquema de Debilidad/Resistencia
 * @typedef {Object} Weakness
 * @property {string} type - Tipo de Pokémon (fuego, agua, etc)
 * @property {string} value - Multiplicador de daño
 */
const weaknessSchema = new mongoose.Schema(
  {
    type: String,
    value: String,
  },
  { _id: false }
);

/**
 * Esquema específico de Carta Pokémon (solo campos únicos)
 *
 * Hereda todos los campos comunes de Card (nombre, set, rarity, images, price, etc.)
 * y añade solo los campos específicos de Pokémon.
 *
 * @typedef {Object} PokemonCardExtension
 * @property {string} subtype - Subtipo de Pokémon (Basic, Stage 1, Stage 2, etc.)
 * @property {string} hp - Puntos de salud
 * @property {Array<string>} types - Tipos del Pokémon (Fire, Water, etc.)
 * @property {string} evolvesFrom - Pokémon anterior en la evolución
 * @property {Array<Ability>} abilities - Habilidades de la carta
 * @property {Array<Attack>} attacks - Ataques disponibles
 * @property {Array<Weakness>} weaknesses - Debilidades de tipos
 * @property {Array<Weakness>} resistances - Resistencias de tipos
 * @property {Array<string>} retreatCost - Costo de retirada
 * @property {number} nationalPokedexNumber - Número en Pokédex Nacional
 */
const pokemonCardSchema = new mongoose.Schema({
  subtype: { type: String },
  hp: { type: String },
  types: [{ type: String }],
  evolvesFrom: { type: String },
  abilities: [abilitySchema],
  attacks: [attackSchema],
  weaknesses: [weaknessSchema],
  resistances: [weaknessSchema],
  retreatCost: [{ type: String }],
  nationalPokedexNumber: { type: Number },
});

/**
 * Modelo de Carta Pokémon como discriminator de Card
 * Automáticamente hereda todos los campos de Card
 * y añade los campos específicos definidos arriba.
 *
 * category='pokemon' se establece automáticamente
 *
 * @type {mongoose.Model}
 */
export const PokemonCard = Card.discriminator('pokemon', pokemonCardSchema);
