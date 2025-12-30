import mongoose, { Schema } from "mongoose";
//TODO add feature and higlights for more info in  a single 
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
    duration: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    available: {
      type: Boolean,
    },
    trip_type: {
      type: String,
      enum: ["domestic", "international"],
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
