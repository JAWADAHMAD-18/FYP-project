import mongoose, { Schema } from "mongoose";
const packageSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    highlights: {
      type: String,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
    },
    durationNights: {
      type: Number,
      required: true,
    },
    // Legacy single image used by existing UI cards
    image: {
      type: String,
      required: true,
    },
    // New fields (production-ready media model)
    coverImage: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    imagePublicId: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: "",
    },
    available: {
      type: Boolean,
    },
    trip_type: {
      type: String,
      enum: ["domestic", "international"],
      required: true,
    },
    category: {
      type: String,
      enum: ["accommodations", "flights", "experiences"],
      required: true,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    available_slot: {
      type: Number,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("Package", packageSchema);
