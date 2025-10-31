import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISettings extends Document {
  commissionRate: number;
  platformName: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    commissionRate: {
      type: Number,
      required: true,
      default: 10,
      min: [0, "Commission rate cannot be negative"],
      max: [100, "Commission rate cannot exceed 100"],
    },
    platformName: {
      type: String,
      default: "ReShoe",
    },
    contactEmail: {
      type: String,
      default: "support@reshoe.com",
    },
  },
  {
    timestamps: true,
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
