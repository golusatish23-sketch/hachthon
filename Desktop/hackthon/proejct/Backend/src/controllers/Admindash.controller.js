import { User } from "../models/user.model.js";
import { Buyer } from "../models/buyer.model.js";
import { Crop } from "../models/crop.model.js";
import { Bid } from "../models/bid.model.js";
import { BuyerRequirement } from "../models/buyerRequirement.model.js";
import { Transportation } from "../models/transportation.model.js";

import { asyncHandler } from "../utils/asynchandler.js";
import ApiResponse from "../utils/apiresponse.js";
import ApiError from "../utils/apiError.js";

const GetAdminDashboard = asyncHandler(async (req, res) => {
  // Sirf admin dashboard access kar sake
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can access this dashboard");
  }

  // Total users
  const totalUsers = await User.countDocuments();

  // Buyer summary
  const totalBuyers = await Buyer.countDocuments();
  const pendingBuyers = await Buyer.countDocuments({
    status: "PENDING",
  });
  const activeBuyers = await Buyer.countDocuments({
    status: "ACTIVE",
  });
  const rejectedBuyers = await Buyer.countDocuments({
    status: "REJECTED",
  });

  // Crop summary
  const totalCrops = await Crop.countDocuments();
  const availableCrops = await Crop.countDocuments({
    status: "AVAILABLE",
  });
  const soldCrops = await Crop.countDocuments({
    status: "SOLD",
  });

  // Bid summary
  const totalBids = await Bid.countDocuments();
  const pendingBids = await Bid.countDocuments({
    status: "PENDING",
  });
  const acceptedBids = await Bid.countDocuments({
    status: "ACCEPTED",
  });
  const rejectedBids = await Bid.countDocuments({
    status: "REJECTED",
  });

  // Buyer requirements summary
  const totalRequirements = await BuyerRequirement.countDocuments();
  const openRequirements = await BuyerRequirement.countDocuments({
    status: "OPEN",
  });

  // Transportation summary
  const totalVehicles = await Transportation.countDocuments();
  const availableVehicles = await Transportation.countDocuments({
    status: "AVAILABLE",
  });
  const bookedVehicles = await Transportation.countDocuments({
    status: "BOOKED",
  });
  const deliveriesInTransit = await Transportation.countDocuments({
    status: "IN_TRANSIT",
  });
  const deliveredVehicles = await Transportation.countDocuments({
    status: "DELIVERED",
  });

  // Recent registered users
  const recentUsers = await User.find()
    .select("-password -refreshToken")
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent crop listings
  const recentCrops = await Crop.find()
    .populate("farmer", "fullname username")
    .sort({ createdAt: -1 })
    .limit(5);

  // Pending buyer profiles for admin review
  const buyersAwaitingApproval = await Buyer.find({
    status: "PENDING",
  })
    .populate("owner", "fullname username")
    .sort({ createdAt: -1 })
    .limit(5);

  const dashboard = {
    users: {
      total: totalUsers,
    },

    buyers: {
      total: totalBuyers,
      pending: pendingBuyers,
      active: activeBuyers,
      rejected: rejectedBuyers,
    },

    crops: {
      total: totalCrops,
      available: availableCrops,
      sold: soldCrops,
    },

    bids: {
      total: totalBids,
      pending: pendingBids,
      accepted: acceptedBids,
      rejected: rejectedBids,
    },

    requirements: {
      total: totalRequirements,
      open: openRequirements,
    },

    transportation: {
      total: totalVehicles,
      available: availableVehicles,
      booked: bookedVehicles,
      inTransit: deliveriesInTransit,
      delivered: deliveredVehicles,
    },

    recentUsers,
    recentCrops,
    buyersAwaitingApproval,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      dashboard,
      "Admin dashboard fetched successfully"
    )
  );
});

export { GetAdminDashboard };
