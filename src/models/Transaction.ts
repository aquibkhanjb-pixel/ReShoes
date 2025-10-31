import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  seller: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  amount: number;
  commission: number;
  commissionRate: number;
  sellerEarnings: number;
  payoutStatus: "pending" | "processing" | "completed" | "failed";
  payoutDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    commissionRate: {
      type: Number,
      required: true,
      default: 10,
    },
    sellerEarnings: {
      type: Number,
      required: true,
    },
    payoutStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    payoutDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ seller: 1, payoutStatus: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);

export default Transaction;
