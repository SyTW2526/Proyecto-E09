import mongoose from 'mongoose';

const trainerCardSchema = new mongoose.Schema({
  pokemonTcgId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  supertype: { type: String },
  subtype: { type: String },
  series: { type: String },
  set: { type: String },
  rarity: { type: String },
  images: {
    small: String,
    large: String
  },
  text: { type: String },
  effect: { type: String },
  artist: { type: String },
  cardNumber: { type: String },
  marketPrice: { type: Number, default: 0 },
  lastPriceUpdate: { type: Date }
}, { timestamps: true });

export const TrainerCard = mongoose.model('TrainerCard', trainerCardSchema);
