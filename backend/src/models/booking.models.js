import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    numPeople: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    packageSnapshot: {
      type: Object, // can also use a sub-schema for structure
      required: true,
    },

    pricePerPerson: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    bookingDate: {
      type: Date,
      default: () => new Date(),
    },
    travelDate: {
      type: Date,
    },
    bookingStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["NotPaid", "Paid", "Refunded"],
      default: "NotPaid",
    },
    // fakePayment: { type: Boolean, default: true }, // because no real gateway
    cancelReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    // emailSent: { type: Boolean, default: false },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

BookingSchema.index({ user: 1, bookingDate: -1 });
BookingSchema.index({ package: 1, bookingStatus: 1 });

export default mongoose.model("Booking", BookingSchema);
