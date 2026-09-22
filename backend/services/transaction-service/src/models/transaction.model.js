import mongoose, { Schema } from "mongoose";

const transactionSchema = new Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Transaction must have a source account"],
      index: true,
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Transaction must have a destination account"],
      index: true,
    },

    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0.01, "Transaction amount must be positive"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "reversed"],
        message: "Transaction status must be pending, completed, failed, or reversed",
      },
      default: "pending",
    },

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required for transaction"],
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
