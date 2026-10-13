import { Buyer } from "../models/buyer.model.js";
import { BuyerRequirement } from "../models/buyerRequirement.model.js";
import { Bid } from "../models/bid.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiresponse.js";

const GetBuyerDashboard = asyncHandler(async (req, res) => {
  // Logged-in user ka buyer profile
  const buyer = await Buyer.findOne({
    owner: req.user._id,
  });

  if (!buyer) {
    throw new ApiError(404, "Buyer profile not found");
  }

  // Buyer ki requirements ka summary
  const requirementSummary = await BuyerRequirement.aggregate([
    {
      $match: {
        buyer: buyer._id,
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);

  // Buyer ki bids ka summary
  const bidSummary = await Bid.aggregate([
    {
      $match: {
        buyer: buyer._id,
      },
    },
    {
      $group: {
        _id: "$status",
        total: { $sum: 1 },
      },
    },
  ]);

  // Recent requirements
  const recentRequirements = await BuyerRequirement.find({
    buyer: buyer._id,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("address");

  // Recent bids
  const recentBids = await Bid.find({
    buyer: buyer._id,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("crop", "cropName quantity expectedPrice quality")
    .populate("farmer", "fullname username");

  // Requirement summary
  const requirements = {
    total: 0,
    open: 0,
    fulfilled: 0,
    cancelled: 0,
  };

  for (const item of requirementSummary) {
    requirements.total += item.total;

    if (item._id === "OPEN") requirements.open = item.total;
    if (item._id === "FULFILLED") requirements.fulfilled = item.total;
    if (item._id === "CANCELLED") requirements.cancelled = item.total;
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
    buyer: {
      businessName: buyer.businessName,
      status: buyer.status,
      businessType: buyer.businessType,
    },
    requirements,
    bids,
    recentRequirements,
    recentBids,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      dashboard,
      "Buyer dashboard fetched successfully"
    )
  );
});

export { GetBuyerDashboard };
