const mongoose = require('mongoose');

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
    lowercase: true
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
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // Crea automáticamente createdAt y updatedAt
});

module.exports = mongoose.model('User', userSchema);