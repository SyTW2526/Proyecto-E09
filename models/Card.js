const mongoose = require('mongoose');

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
  series: String,
  set: String,
  rarity: String,
  types: [String],
  imageUrl: String,
  imageUrlHiRes: String,
  marketPrice: {
    type: Number,
    default: 0
  },
  lastPriceUpdate: Date,
  nationalPokedexNumber: Number,
  artist: String,
  cardNumber: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Card', cardSchema);