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
  illustrator: { type: String },
  price: {
    cardmarketAvg: { type: Number, default: null },
    tcgplayerMarketPrice: { type: Number, default: null },
    avg: { type: Number, default: 0 }
  },
  artist: { type: String },
  cardNumber: { type: String },
  marketPrice: { type: Number, default: 0 },
  lastPriceUpdate: { type: Date }
}, { timestamps: true });

// ensure category exists on trainer cards
trainerCardSchema.add({ category: { type: String, enum: ['pokemon','trainer','energy','unknown'], default: 'trainer' } });

export const TrainerCard = mongoose.model('TrainerCard', trainerCardSchema);
