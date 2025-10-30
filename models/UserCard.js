const mongoose = require('mongoose');

const userCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  pokemonTcgId: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['Mint', 'Near Mint', 'Excellent', 'Good', 'Poor'],
    default: 'Near Mint'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  acquisitionDate: {
    type: Date,
    default: Date.now
  },
  notes: String,
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  estimatedValue: Number,
  forTrade: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice compuesto para búsquedas eficientes
userCardSchema.index({ userId: 1, cardId: 1 });
userCardSchema.index({ userId: 1, isPublic: 1 });

module.exports = mongoose.model('UserCard', userCardSchema);