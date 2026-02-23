import asyncHandler from "../utills/asynchandler.utills.js";
import Booking from "../models/booking.models.js";
import { ApiResponse } from "../utills/apiResponse.utills.js";
import {
  getCache,
  setCache,
  deleteCache,
} from "../utills/localRedis.utills.js";

// Constants

const CACHE_KEY = "admin:dashboard:summary";
const CACHE_TTL = 60; // 60 seconds

const getKarachiMonthBoundaries = () => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const parts = formatter.formatToParts(now);
  const karachiYear = parseInt(parts.find((p) => p.type === "year").value, 10);
  const karachiMonth = parseInt(
    parts.find((p) => p.type === "month").value,
    10
  ); // 1-indexed

  // Start of current month in PKT → convert to UTC by subtracting 5 hours
  const startOfCurrentMonth = new Date(
    Date.UTC(karachiYear, karachiMonth - 1, 1, -5, 0, 0, 0)
  );

  // Start of previous month in PKT → same offset
  const prevMonth = karachiMonth === 1 ? 12 : karachiMonth - 1;
  const prevYear = karachiMonth === 1 ? karachiYear - 1 : karachiYear;
  const startOfPreviousMonth = new Date(
    Date.UTC(prevYear, prevMonth - 1, 1, -5, 0, 0, 0)
  );

  return {
    startOfCurrentMonth,
    startOfPreviousMonth,
    karachiYear,
    karachiMonth,
  };
};

const getLastNMonths = (n) => {
  const { karachiYear, karachiMonth } = getKarachiMonthBoundaries();
  const months = [];

  for (let i = n - 1; i >= 0; i--) {
    let m = karachiMonth - i;
    let y = karachiYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    months.push({ year: y, month: m });
  }

  return months;
};

const formatMonthLabel = (year, month) => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};

// for revenue chart
const getRevenueStats = async () => {
  const result = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        bookingStatus: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        paidBookingsCount: { $sum: 1 },
      },
    },
  ]);

  const stats = result[0] || { totalRevenue: 0, paidBookingsCount: 0 };

  return {
    totalRevenue: stats.totalRevenue,
    paidBookingsCount: stats.paidBookingsCount,
  };
};

// for booking stats
const getBookingStats = async () => {
  const result = await Booking.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        pending: [
          { $match: { bookingStatus: "Pending" } },
          { $count: "count" },
        ],
        confirmed: [
          { $match: { bookingStatus: "Confirmed" } },
          { $count: "count" },
        ],
        cancelled: [
          { $match: { bookingStatus: "Cancelled" } },
          { $count: "count" },
        ],
      },
    },
  ]);

  const data = result[0] || {};

  return {
    total: data.total?.[0]?.count || 0,
    pending: data.pending?.[0]?.count || 0,
    confirmed: data.confirmed?.[0]?.count || 0,
    cancelled: data.cancelled?.[0]?.count || 0,
  };
};

// for monthly growth
const getMonthlyGrowthStats = async () => {
  const { startOfCurrentMonth, startOfPreviousMonth } =
    getKarachiMonthBoundaries();

  const result = await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: startOfPreviousMonth },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$bookingDate" },
          month: { $month: "$bookingDate" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  // Map results by "year-month" key
  const countMap = {};
  for (const entry of result) {
    const key = `${entry._id.year}-${entry._id.month}`;
    countMap[key] = entry.count;
  }

  const currentKey = `${startOfCurrentMonth.getUTCFullYear()}-${startOfCurrentMonth.getUTCMonth() + 1}`;
  // Adjust for PKT offset — the UTC date may be in the previous month
  const { karachiYear, karachiMonth } = getKarachiMonthBoundaries();
  const prevMonth = karachiMonth === 1 ? 12 : karachiMonth - 1;
  const prevYear = karachiMonth === 1 ? karachiYear - 1 : karachiYear;

  const currentMonthBookings = countMap[`${karachiYear}-${karachiMonth}`] || 0;
  const previousMonthBookings = countMap[`${prevYear}-${prevMonth}`] || 0;

  // Growth percentage with edge-case handling
  let growthPercentage = 0;
  if (previousMonthBookings === 0 && currentMonthBookings > 0) {
    growthPercentage = 100;
  } else if (previousMonthBookings === 0 && currentMonthBookings === 0) {
    growthPercentage = 0;
  } else if (previousMonthBookings > 0 && currentMonthBookings === 0) {
    growthPercentage = -100;
  } else {
    growthPercentage = parseFloat(
      (
        ((currentMonthBookings - previousMonthBookings) /
          previousMonthBookings) *
        100
      ).toFixed(1)
    );
  }

  return {
    currentMonthBookings,
    previousMonthBookings,
    growthPercentage,
  };
};

// for recent activity
const getRecentActivity = async (limit = 10) => {
  const recentBookings = await Booking.find()
    .sort({ bookingDate: -1 })
    .limit(limit)
    .select(
      "bookingCode bookingStatus paymentStatus totalPrice numPeople bookingDate packageSnapshot.title packageSnapshot.destination"
    )
    .populate("user", "name email profilePic")
    .lean();

  return recentBookings.map((booking) => ({
    bookingCode: booking.bookingCode,
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus,
    totalPrice: booking.totalPrice,
    numPeople: booking.numPeople,
    bookingDate: booking.bookingDate,
    packageTitle: booking.packageSnapshot?.title || "N/A",
    destination: booking.packageSnapshot?.destination || "N/A",
    user: booking.user
      ? {
          name: booking.user.name,
          email: booking.user.email,
          profilePic: booking.user.profilePic,
        }
      : null,
  }));
};

// for revenue chart (6 months)
const getMonthlyRevenueChart = async () => {
  const months = getLastNMonths(6);
  const oldestMonth = months[0];

  // Calculate the start boundary for the oldest month (PKT → UTC)
  const startBoundary = new Date(
    Date.UTC(oldestMonth.year, oldestMonth.month - 1, 1, -5, 0, 0, 0)
  );

  const result = await Booking.aggregate([
    {
      $match: {
        paymentStatus: "Paid",
        bookingStatus: { $ne: "Cancelled" },
        bookingDate: { $gte: startBoundary },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$bookingDate" },
          month: { $month: "$bookingDate" },
        },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Build a lookup map from aggregation results
  const revenueMap = {};
  for (const entry of result) {
    revenueMap[`${entry._id.year}-${entry._id.month}`] = entry.revenue;
  }

  // Ensure all 6 months are present, filling gaps with 0
  const labels = [];
  const data = [];

  for (const { year, month } of months) {
    labels.push(formatMonthLabel(year, month));
    data.push(revenueMap[`${year}-${month}`] || 0);
  }

  return { labels, data };
};

// Main controller — aggregates all dashboard data

export const getDashboardSummary = asyncHandler(async (req, res) => {
  //Check Redis cache first
  const cached = await getCache(CACHE_KEY);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          cached,
          "Dashboard summary fetched successfully (cached)"
        )
      );
  }

  // Compute all stats in parallel
  const [revenue, bookings, growth, recentActivity, revenueChart] =
    await Promise.all([
      getRevenueStats(),
      getBookingStats(),
      getMonthlyGrowthStats(),
      getRecentActivity(),
      getMonthlyRevenueChart(),
    ]);

  // Assemble response
  const dashboardData = {
    revenue,
    bookings,
    growth,
    recentActivity,
    revenueChart,
    generatedAt: new Date().toISOString(),
  };

  //  Cache result (fire-and-forget, non-blocking)
  setCache(CACHE_KEY, dashboardData, CACHE_TTL);

  //  Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        dashboardData,
        "Dashboard summary fetched successfully"
      )
    );
});

// Cache invalidation utility — used by other controllers on booking mutations

export const invalidateDashboardCache = () => {
  deleteCache(CACHE_KEY).catch(() => {
    // Silently fail — Redis unavailability should never block booking ops
  });
};
