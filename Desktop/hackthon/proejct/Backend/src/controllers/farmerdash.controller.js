
import { Crop } from "../models/crop.model.js";
import { Bid } from "../models/bid.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiResponse from "../utils/apiresponse.js";

// Farmer Dashboard
const GetFarmerDashboard = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  // Farmer ki saari crops ka summary
  const cropSummary = await Crop.aggregate([
    {
      $match: {
        farmer: farmerId,
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  // Farmer ki crops par aayi bids ka summary
  const bidSummary = await Bid.aggregate([
    {
      $match: {
        farmer: farmerId,
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);

  // Recent crops
  const recentCrops = await Crop.find({
    farmer: farmerId,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("address");

  // Recent bids
  const recentBids = await Bid.find({
    farmer: farmerId,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("crop", "cropName quantity expectedPrice")
    .populate("buyer", "businessName buyerPhone");

  // Crop summary ko readable object mein convert karna
  const crops = {
    total: 0,
    available: 0,
    sold: 0,
    inactive: 0,
    totalQuantity: 0,
  };

  for (const item of cropSummary) {
    crops.total += item.total;

    if (item._id === "AVAILABLE") {
      crops.available = item.total;
      crops.totalQuantity += item.totalQuantity;
    }

    if (item._id === "SOLD") {
      crops.sold = item.total;
    }

    if (item._id === "INACTIVE") {
      crops.inactive = item.total;
    }
  }

  // Bid summary
  const bids = {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0,
  };

  for (const item of bidSummary) {
    bids.total += item.total;

    if (item._id === "PENDING") bids.pending = item.total;
    if (item._id === "ACCEPTED") bids.accepted = item.total;
    if (item._id === "REJECTED") bids.rejected = item.total;
    if (item._id === "CANCELLED") bids.cancelled = item.total;
  }

  const dashboard = {
    crops,
    bids,
    recentCrops,
    recentBids,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      dashboard,
      "Farmer dashboard fetched successfully"
    )
  );
});

export { GetFarmerDashboard };
