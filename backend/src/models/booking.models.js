import mongoose from "mongoose";

const PackageSnapshotSchema = new mongoose.Schema(
  {
    title: String,
    destination: String,
    durationDays: Number,
    basePrice: Number,
    images: [String],
    includes: [String],
    excludes: [String],
  },
  { _id: false }
);

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
      type: PackageSnapshotSchema,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
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
    bookingCode: {
      type: String,
      unique: true,
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
    paymentProof: {
      imageUrl: {
        type: String,
        default: null,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
      verified: {
        type: Boolean,
        default: false,
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      verifiedAt: {
        type: Date,
        default: null,
      },
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
    cancelledBy: {
      type: String,
      enum: ["User", "Admin", null],
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
BookingSchema.index({ bookingStatus: 1, paymentStatus: 1 });
//pre save hook
BookingSchema.pre("save", function (next) {
  if (!this.bookingCode) {
    this.bookingCode = `TF-${new Date().getFullYear()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
  }
  next();
});

export default mongoose.model("Booking", BookingSchema);
