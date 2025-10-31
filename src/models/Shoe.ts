import mongoose, { Document, Model, Schema } from "mongoose";

export interface IShoe extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  brand: string;
  size: number;
  condition: "new" | "like-new" | "good" | "fair" | "worn";
  price: number;
  description: string;
  images: string[];
  status: "pending-approval" | "approved" | "rejected" | "sold";
  approvalStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  category: "men" | "women" | "unisex" | "kids";
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const shoeSchema = new Schema<IShoe>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Please provide a brand"],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, "Please provide a size"],
    },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "worn"],
      required: [true, "Please specify the condition"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    images: {
      type: [String],
      required: [true, "Please provide at least one image"],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: "At least one image is required",
      },
    },
    status: {
      type: String,
      enum: ["pending-approval", "approved", "rejected", "sold"],
      default: "pending-approval",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["men", "women", "unisex", "kids"],
      required: [true, "Please specify a category"],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
shoeSchema.index({ seller: 1, status: 1 });
shoeSchema.index({ brand: 1, category: 1 });
shoeSchema.index({ price: 1 });

const Shoe: Model<IShoe> =
  mongoose.models.Shoe || mongoose.model<IShoe>("Shoe", shoeSchema);

export default Shoe;
