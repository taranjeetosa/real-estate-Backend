import mongoose from "mongoose";
const deliveryState = {
  type: String,
  enum: ["pending", "sent", "failed", "skipped"],
  default: "pending",
};
const s = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    countryCode: { type: String, trim: true, maxlength: 8 },
    phone: { type: String, required: true, trim: true, maxlength: 32 },
    whatsappNumber: { type: String, trim: true, maxlength: 41 },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      index: true,
    },
    pathway: { type: String, required: true },
    preferredTime: String,
    source: { type: String, required: true, enum: ["lead-popup", "show-interest-form"] },
    ip: String,
    userAgent: String,
    delivery: {
      sheet: {
        state: deliveryState,
        error: String,
        attempts: { type: Number, default: 0 },
        at: Date,
        row: Number,
      },
      confirmationEmail: {
        state: deliveryState,
        error: String,
        attempts: { type: Number, default: 0 },
        at: Date,
        providerId: String,
      },
    },
  },
  { timestamps: true },
);
s.index({ createdAt: -1 });
export default mongoose.model("Enquiry", s);
