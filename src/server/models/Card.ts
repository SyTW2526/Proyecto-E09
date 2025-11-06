import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  pokemonTcgId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  series: {
    type: String
  },
  set: {
    type: String
  },
  rarity: {
    type: String
  },
  types: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  imageUrlHiRes: {
    type: String
  },
  marketPrice: {
    type: Number,
    default: 0
  },
  lastPriceUpdate: {
    type: Date
  },
  nationalPokedexNumber: {
    type: Number
  },
  artist: {
    type: String
  },
  cardNumber: {
    type: String
  }
}, {
  timestamps: true
});


export const Card = mongoose.model('Card', cardSchema);
