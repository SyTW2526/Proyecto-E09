
import mongoose from "mongoose";

const { Schema } = mongoose;

const friendTradeRoomInviteSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
    default: "pending",
  },

  privateRoomCode: {
    type: String,
    default: null,
  },

  tradeId: {
    type: Schema.Types.ObjectId,
    ref: "Trade",
    default: null,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
},
{
  timestamps: true,
});

export const FriendTradeRoomInvite = mongoose.model("FriendTradeRoomInvite", friendTradeRoomInviteSchema);
