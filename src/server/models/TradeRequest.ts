import mongoose from "mongoose";

const tradeRequestSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pokemonTcgId: {
      type: String,
      required: true,
    },
    cardName: {
      type: String,
      default: "",
    },
    cardImage: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
    },
     isManual: {
      type: Boolean,
      default: false, 
    },
    tradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trade",
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Borrar automáticamente solicitudes finalizadas 2 días después
tradeRequestSchema.index(
  { finishedAt: 1 },
  {
    expireAfterSeconds: 2 * 24 * 60 * 60, 
    partialFilterExpression: { finishedAt: { $ne: null } },
  }
);

export const TradeRequest = mongoose.model("TradeRequest", tradeRequestSchema);
