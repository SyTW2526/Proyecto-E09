import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate(value: string) {
      if (!validator.default.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    }
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  settings: {
    language: {
      type: String,
      default: 'es'
    },
    notifications: {
      trades: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true }
    },
    privacy: {
      showCollection: { type: Boolean, default: true },
      showWishlist: { type: Boolean, default: true }
    }
  },
  friends: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ],
  blockedUsers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  ]
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
