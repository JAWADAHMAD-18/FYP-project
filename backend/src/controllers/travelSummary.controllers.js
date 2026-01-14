import asyncHandler from "../utills/asynchandler.utills.js";
import Booking from "../models/booking.models.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import { ApiError } from "../utills/apiError.utills.js";


export const getTravelSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const bookings = await Booking.find({ user: userId })
    .populate("package")
    .lean();

  if (!bookings || bookings.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "No bookings found", {
        totalSpent: 0,
        fusionSavings: 0,
        categoryBreakdown: [],
      })
    );
  }

  // Total spent
  const totalSpent = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  // Fusion savings (if tracked in booking)
  const fusionSavings = bookings.reduce((sum, b) => sum + (b.savings || 0), 0);

  // Category breakdown
  const categoryTotals = { accommodations: 0, flights: 0, experiences: 0 };
  bookings.forEach((b) => {
    const category = b.package?.category?.toLowerCase();
    if (category && categoryTotals.hasOwnProperty(category)) {
      categoryTotals[category] += b.totalPrice || 0;
    }
  });

  const totalCategories = Object.values(categoryTotals).reduce(
    (a, b) => a + b,
    0
  );
  const categoryBreakdown = Object.entries(categoryTotals).map(
    ([name, value]) => ({
      name,
      percentage: totalCategories
        ? Math.round((value / totalCategories) * 100)
        : 0,
    })
  );

  // Send formatted response
  return res.status(200).json(
    new ApiResponse(200,  {
      totalSpent,
      fusionSavings,
      categoryBreakdown,
    },"Travel summary retrieved successfully")
  );
});
