/**
 * @file Card.ts
 * @description Modelo BASE de Carta con Discriminator Pattern
 *
 * Modelo base que contiene campos comunes a todas las cartas Pokémon TCG.
 * Usa el patrón discriminator de Mongoose para soportar herencia en una
 * única colección (polimorfismo en MongoDB).
 *
 * Submodelos (discriminators):
 * - PokemonCard - Cartas de Pokémon
 * - TrainerCard - Cartas de Entrenador
 * - EnergyCard - Cartas de Energía
 *
 * Campos Base:
 * - ID único (pokemonTcgId)
 * - Nombre y descripción
 * - Imágenes (grande y pequeña)
 * - Datos de rareza y precios
 * - Metadatos de set y número
 *
 * @author Proyecto E09
 * @version 1.0.0
 * @requires mongoose
 * @module server/models/Card
 * @see PokemonCard
 * @see TrainerCard
 * @see EnergyCard
 */

import mongoose from 'mongoose';

/**
 * Esquema BASE de Carta (común a todas las categorías)
 *
 * @typedef {Object} BaseCard
 * @property {string} pokemonTcgId - ID único de la API TCG Pokémon
 * @property {string} name - Nombre de la carta
 * @property {string} supertype - Tipo principal (Pokémon, Trainer, Energy)
 * @property {string} series - Serie a la que pertenece
 * @property {string} set - Nombre del conjunto/extensión
 * @property {string} rarity - Rareza de la carta
 * @property {Object} images - URLs de imágenes
 * @property {string} images.small - Imagen pequeña
 * @property {string} images.large - Imagen grande (alta resolución)
 * @property {string} illustrator - Ilustrador/artista de la carta
 * @property {Object} price - Información de precios de diferentes mercados
 * @property {number} price.cardmarketAvg - Precio promedio de Cardmarket
 * @property {number} price.tcgplayerMarketPrice - Precio de TCGPlayer
 * @property {number} price.avg - Precio promedio calculado
 * @property {Date} lastPriceUpdate - Última actualización de precios
 * @property {string} cardNumber - Número de carta en el conjunto
 * @property {string} category - Discriminator key (pokemon, trainer, energy, unknown)
 * @property {Date} createdAt - Fecha de creación (automático)
 * @property {Date} updatedAt - Fecha de última actualización (automático)
 */
const cardSchema = new mongoose.Schema(
  {
    pokemonTcgId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    supertype: {
      type: String,
    },
    series: {
      type: String,
    },
    set: {
      type: String,
      index: true,
    },
    rarity: {
      type: String,
      index: true,
    },
    images: {
      small: { type: String },
      large: { type: String },
    },
    illustrator: {
      type: String,
    },
    price: {
      cardmarketAvg: { type: Number, default: null },
      tcgplayerMarketPrice: { type: Number, default: null },
      avg: { type: Number, default: 0 },
    },
    lastPriceUpdate: {
      type: Date,
    },
    cardNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'category',
    collection: 'cards',
  }
);

/**
 * Índices compuestos para búsquedas frecuentes
 */
cardSchema.index({ name: 1, set: 1 });
cardSchema.index({ category: 1, rarity: 1 });
cardSchema.index({ set: 1, cardNumber: 1 });

/**
 * Modelo BASE de Carta exportado
 * Los discriminators (PokemonCard, TrainerCard, EnergyCard) heredan de este modelo
 *
 * @type {mongoose.Model}
 */
export const Card = mongoose.model('Card', cardSchema);
