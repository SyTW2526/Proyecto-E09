import mongoose from "mongoose";
import { nanoid } from "nanoid";

const tradeSideCardSchema = new mongoose.Schema({
  userCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserCard",
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
  },
  estimatedValue: {
    type: Number,
  },
},{ _id: false });

const tradeSchema = new mongoose.Schema({
    initiatorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    tradeType: {
      type: String,
      enum: ["public", "private"],
      required: true,
    },
    privateRoomCode: {
      type: String,
    },

    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TradeRequest",
      default: null,
    },

  
    requestedPokemonTcgId: {
      type: String,
      default: null,
    },

    
    initiatorCards: [tradeSideCardSchema],
    receiverCards: [tradeSideCardSchema],

    initiatorCardUserCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCard",
      default: null,
    },
    receiverCardUserCardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCard",
      default: null,
    },
    initiatorAccepted: {
      type: Boolean,
      default: false,
    },
    receiverAccepted: {
      type: Boolean,
      default: false,
    },

    initiatorTotalValue: {
      type: Number,
    },
    receiverTotalValue: {
      type: Number,
    },
    valueDifferencePercentage: {
      type: Number,
    },

    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

tradeSchema.index({ privateRoomCode: 1 });
tradeSchema.index({ initiatorUserId: 1 });
tradeSchema.index({ receiverUserId: 1 });
tradeSchema.index({ status: 1 });

tradeSchema.pre("save", function (next) {
  const trade: any = this;

  if (trade.tradeType === "private" && !trade.privateRoomCode) {
    trade.privateRoomCode = nanoid(10);
  }

  if (
    trade.tradeType === "public" &&
    typeof trade.initiatorTotalValue === "number" &&
    typeof trade.receiverTotalValue === "number"
  ) {
    const diff = Math.abs(
      trade.initiatorTotalValue - trade.receiverTotalValue
    );
    const maxValue = Math.max(
      trade.initiatorTotalValue,
      trade.receiverTotalValue
    );

    trade.valueDifferencePercentage = maxValue > 0 ? (diff / maxValue) * 100 : 0;

    if (trade.valueDifferencePercentage > 10) {
      return next(
        new Error(
          "La diferencia de valor no puede superar el 10% en intercambios públicos"
        )
      );
    }
  }

  next();
});

export const Trade = mongoose.model("Trade", tradeSchema);
