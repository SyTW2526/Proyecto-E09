import mongoose from 'mongoose';

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
  notes: {
    type: String
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  estimatedValue: {
    type: Number
  },
  forTrade: {
    type: Boolean,
    default: false
  },
  collectionType: {
    type: String,
    enum: ['collection', 'wishlist'],
    default: 'collection'
  }
}, {
  timestamps: true
});


userCardSchema.index({ userId: 1, cardId: 1 });
userCardSchema.index({ userId: 1, isPublic: 1 });
userCardSchema.index({ userId: 1, collectionType: 1 });

export const UserCard = mongoose.model('UserCard', userCardSchema);
