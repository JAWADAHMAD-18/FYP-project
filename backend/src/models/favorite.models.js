import mongoose from "mongoose";

const { Schema } = mongoose;

const FavoriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    package: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FavoriteSchema.index({ user: 1, package: 1 }, { unique: true });

export default mongoose.model("Favorite", FavoriteSchema);
