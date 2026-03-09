import { ApiResponse } from "../utills/apiResponse.utills.js";
import asyncHandler from "../utills/asynchandler.utills.js";
import { ApiError } from "../utills/apiError.utills.js";
import {
  generateCustomPackage,
  confirmCustomPackage,
  updateCustomPackageStatusByRequestId,
  getCustomPackageByRequestId,
  adminUpdateCustomPackageStatus,
} from "../services/customPackage.service.js";

export const createCustomPackage = asyncHandler(async (req, res) => {
  const {
    tripType,
    locations,
    start_date,
    end_date,
    adults = 1,
    budgetPreference = "medium",
  } = req.body;

  if (!["domestic", "international"].includes(tripType)) {
    throw new ApiError(400, "Trip type must be 'domestic' or 'international'");
  }

  if (!Array.isArray(locations) || locations.length < 1) {
    throw new ApiError(400, "At least one location is required");
  }

  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User authentication required to create package");
  }

  const preview = await generateCustomPackage({
    userId,
    tripType,
    locations,
    start_date,
    end_date,
    adults,
    budgetPreference,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Custom package created successfully",
        preview
      )
    );
});

export const confirmCustomPackageController = asyncHandler(
  async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      throw new ApiError(401, "User authentication required to confirm package");
    }

    const preview = req.body?.preview || req.body;

    const result = await confirmCustomPackage({
      userId,
      preview,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Custom package confirmed successfully",
          result
        )
      );
  }
);

export const setCustomPackageNegotiating = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User authentication required");
  }
  const requestId = req.body?.requestId ?? req.params?.requestId;
  if (!requestId) {
    throw new ApiError(400, "requestId is required");
  }
  const result = await updateCustomPackageStatusByRequestId({
    userId,
    requestId,
    nextStatus: "negotiating",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Status updated to negotiating", result));
});

export const adminGetCustomPackageByRequestId = asyncHandler(
  async (req, res) => {
    if (!req.user?.isAdmin) {
      throw new ApiError(403, "Admin access required");
    }
    const { requestId } = req.params;
    const doc = await getCustomPackageByRequestId(requestId);
    return res
      .status(200)
      .json(new ApiResponse(200, doc, "Custom package retrieved"));
  }
);

export const adminSetCustomPackageStatus = asyncHandler(async (req, res) => {
  if (!req.user?.isAdmin) {
    throw new ApiError(403, "Admin access required");
  }
  const { requestId } = req.params;
  const { status, finalSelection } = req.body;
  const result = await adminUpdateCustomPackageStatus({
    requestId,
    nextStatus: status,
    finalSelections: finalSelection ?? {},
  });
  return res
    .status(200)
    .json(new ApiResponse(200, "Status updated", result));
}
);
