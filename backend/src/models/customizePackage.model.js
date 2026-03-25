import mongoose, { Schema } from "mongoose";

const customizePackageSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    destinationImage: {
      type: Object,
      default: null,
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
    },
    inputSnapshot: {
      type: Object,
      default: {},
    },
    flightsSnapshot: {
      type: Array,
      default: [],
    },
    hotelsSnapshot: {
      type: Array,
      default: [],
    },
    poisSnapshot: {
      type: Array,
      default: [],
    },
    weatherSnapshot: {
      type: Array,
      default: [],
    },
    selectedFlights: {
      type: Array,
      default: [],
    },
    selectedHotels: {
      type: Array,
      default: [],
    },
    itinerary: {
      type: Array,
      default: [],
    },
    adminFinalPrice: {
      type: Number,
      default: null,
    },
    assignedAdmin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "generated",
        "negotiating",
        "admin_assigned",
        "finalized",
        "cancelled",
        "expired",
      ],
      default: "generated",
      index: true,
    },
    expiresAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    lastModifiedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    minimize: true,
  }
);

// Additional indexes for query patterns
customizePackageSchema.index({ userId: 1, createdAt: -1 });
customizePackageSchema.index({ requestId: 1 }, { unique: true });

const CustomizePackage = mongoose.model(
  "CustomizePackage",
  customizePackageSchema
);

export default CustomizePackage;

