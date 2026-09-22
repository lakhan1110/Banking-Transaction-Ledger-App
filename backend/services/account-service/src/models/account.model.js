import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Account must be associated with a user"],
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "frozen", "closed"],
      default: "active",
    },

    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ user: 1, status: 1 });

export const Account = mongoose.model("Account", accountSchema);
