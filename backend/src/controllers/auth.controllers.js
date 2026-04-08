import crypto from "crypto";
import bcrypt from "bcrypt";
import { ApiError } from "../utills/apiError.utills.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import User from "../models/users.models.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

// ─── Forgot Password 
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  // Security best practice: always return success even if email not found
  if (!user) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If an account with that email exists, a password reset link has been sent."
        )
      );
  }

  // Generate raw token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash token before storing in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save({ validateBeforeSave: false });

  // Build reset URL with RAW token (user receives unhashed version)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    // If email fails, clear token fields so user can retry
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save({ validateBeforeSave: false });
    console.error("[Auth] Password reset email failed:", err?.message || err);
    throw new ApiError(500, "Failed to send reset email. Please try again.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "If an account with that email exists, a password reset link has been sent."
      )
    );
});

// ─── Reset Password ──────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.query;
  const { newPassword } = req.body;

  if (!token) {
    throw new ApiError(400, "Reset token is required");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  // Hash the incoming token to match what's stored in DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  // Hash new password with bcrypt (same rounds as user.model.js pre-save hook: 10)
  user.password = await bcrypt.hash(newPassword, 10);

  // Clear reset fields
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;

  // Skip the pre-save hook so password isn't double-hashed
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been reset successfully"));
});
