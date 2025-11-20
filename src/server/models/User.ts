import mongoose from 'mongoose';
import validator from 'validator';
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});
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
      default: 'es',
      enum: ['es', 'en']
    },
    darkMode: {
      type: Boolean,
      default: false
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
  ],
  friendRequests: [friendRequestSchema],
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);
