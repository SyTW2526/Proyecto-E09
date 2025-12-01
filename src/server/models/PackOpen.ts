import mongoose from 'mongoose';

const packOpenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true
});

packOpenSchema.index({ userId: 1, createdAt: 1 });

export const PackOpen = mongoose.model('PackOpen', packOpenSchema);
