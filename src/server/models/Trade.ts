import mongoose from 'mongoose';

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
  privateRoomCode: {
    type: String
  },
  initiatorCards: [{
    userCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserCard'
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card'
    },
    estimatedValue: {
      type: Number
    }
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
    estimatedValue: {
      type: Number
    }
  }],
  initiatorTotalValue: {
    type: Number
  },
  receiverTotalValue: {
    type: Number
  },
  valueDifferencePercentage: {
    type: Number
  },
  messages: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

tradeSchema.pre('save', function (next) {
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


export const Trade = mongoose.model('Trade', tradeSchema);
