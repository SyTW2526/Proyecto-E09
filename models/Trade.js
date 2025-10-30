const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  initiatorUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  tradeType: {
    type: String,
    enum: ['public', 'private'],
    required: true
  },
  privateRoomCode: String,
  initiatorCards: [{
    userCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard'
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    },
    estimatedValue: Number
  }],
  receiverCards: [{
    userCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard'
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    },
    estimatedValue: Number
  }],
  initiatorTotalValue: Number,
  receiverTotalValue: Number,
  valueDifferencePercentage: Number,
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: Date
}, {
  timestamps: true
});

// Validación personalizada para el 10% de diferencia
tradeSchema.pre('save', function(next) {
  if (this.initiatorTotalValue && this.receiverTotalValue) {
    const diff = Math.abs(this.initiatorTotalValue - this.receiverTotalValue);
    const maxValue = Math.max(this.initiatorTotalValue, this.receiverTotalValue);
    this.valueDifferencePercentage = (diff / maxValue) * 100;
    
    if (this.valueDifferencePercentage > 10) {
      return next(new Error('La diferencia de valor no puede superar el 10%'));
    }
  }
  next();
});

module.exports = mongoose.model('Trade', tradeSchema);