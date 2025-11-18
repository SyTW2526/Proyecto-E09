import mongoose from 'mongoose';

const attackSchema = new mongoose.Schema({
  name: String,
  cost: [String],
  damage: String,
  text: String
}, { _id: false });

const abilitySchema = new mongoose.Schema({
  name: String,
  text: String,
  type: String
}, { _id: false });

const weaknessSchema = new mongoose.Schema({
  type: String,
  value: String
}, { _id: false });

const pokemonCardSchema = new mongoose.Schema({
  pokemonTcgId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  supertype: { type: String },
  subtype: { type: String },
  hp: { type: String },
  types: [{ type: String }],
  evolvesFrom: { type: String },
  abilities: [abilitySchema],
  attacks: [attackSchema],
  weaknesses: [weaknessSchema],
  resistances: [weaknessSchema],
  retreatCost: [{ type: String }],
  series: { type: String },
  set: { type: String },
  rarity: { type: String },
  images: {
    small: String,
    large: String
  },
  nationalPokedexNumber: { type: Number },
  artist: { type: String },
  cardNumber: { type: String },
  marketPrice: { type: Number, default: 0 },
  lastPriceUpdate: { type: Date }
}, { timestamps: true });

export const PokemonCard = mongoose.model('PokemonCard', pokemonCardSchema);
