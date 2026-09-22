import mongoose, { Schema } from "mongoose";
import { ApiError } from "@bank/shared";

const ledgerSchema = new Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Ledger entry must be associated with an account"],
      index: true,
      immutable: true,
    },

    amount: {
      type: Number,
      required: [true, "Ledger entry amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      immutable: true,
    },

    Transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Ledger entry must be associated with a transaction"],
      index: true,
      immutable: true,
    },

    type: {
      type: String,
      enum: {
        values: ["debit", "credit"],
        message: "Type must be either debit or credit",
      },
      required: [true, "Ledger entry type is required"],
      immutable: true,
    },
  },
  {
    timestamps: true,
  }
);

function preventLedgerModification() {
  throw new ApiError(400, "Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);

/**
 * Calculate dynamic account balance by aggregating immutable ledger entries
 */
ledgerSchema.statics.getBalance = async function (accountId, session = null) {
  const targetId = new mongoose.Types.ObjectId(accountId);

  const aggregatePipeline = [
    { $match: { account: targetId } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: {
          $subtract: ["$totalCredit", "$totalDebit"],
        },
      },
    },
  ];

  let balanceData;
  if (session) {
    balanceData = await this.aggregate(aggregatePipeline).session(session);
  } else {
    balanceData = await this.aggregate(aggregatePipeline);
  }

  return balanceData[0]?.balance || 0;
};

export const Ledger = mongoose.model("Ledger", ledgerSchema);
