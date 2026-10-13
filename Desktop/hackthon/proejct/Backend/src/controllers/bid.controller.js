

import { Bid } from "../models/bid.model.js";
import { Crop } from "../models/crop.model.js";
import { Buyer } from "../models/buyer.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiresponse.js";

// Buyer creates a bid on a crop
const CreateBid = asyncHandler(async (req, res) => {
  const { cropId, offeredPrice, quantity, message = "" } = req.body;

  if (! cropId || offeredPrice == null || quantity == null) {
    throw new ApiError(400, "Crop, offered price and quantity are required");
  }

  if (
    !Number.isFinite(Number(offeredPrice)) ||
    Number(offeredPrice) < 0 ||
    !Number.isFinite(Number(quantity)) ||
    Number(quantity) <= 0
  ) {
    throw new ApiError(400, "Invalid price or quantity");
  }

  const crop = await Crop.findById(cropId);

  if (!crop || crop.status !== "AVAILABLE") {
    throw new ApiError(404, "Crop not found or unavailable");
  }

  // Buyer profile belonging to the logged-in user
  const buyer = await Buyer.findOne({
    owner: req.user._id,
    status: "ACTIVE",
  });

  if (!buyer) {
    throw new ApiError(403, "Active buyer profile required");
  }

  if (crop.farmer.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot bid on your own crop");
  }

  if (Number(quantity) > crop.quantity) {
    throw new ApiError(400, "Bid quantity exceeds available crop quantity");
  }

  const bid = await Bid.create({
    crop: crop._id,
    buyer: buyer._id,
    farmer: crop.farmer,
    offeredPrice: Number(offeredPrice),
    quantity: Number(quantity),
    message,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, bid, "Bid created successfully"));
});

// Buyer sees their own bids
const GetMyBids = asyncHandler(async (req, res) => {
  const buyer = await Buyer.findOne({ owner: req.user._id });

  if (!buyer) {
    throw new ApiError(404, "Buyer profile not found");
  }

  const bids = await Bid.find({ buyer: buyer._id })
    .populate("crop")
    .populate("farmer", "fullname username");

  return res
    .status(200)
    .json(new ApiResponse(200, bids, "Your bids fetched successfully"));
});

// Farmer sees bids on their crops
const GetFarmerBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ farmer: req.user._id })
    .populate("crop")
    .populate("buyer");

  return res
    .status(200)
    .json(new ApiResponse(200, bids, "Farmer bids fetched successfully"));
});

// Farmer accepts a bid
const AcceptBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;

  const bid = await Bid.findById(bidId);

  if (!bid) {
    throw new ApiError(404, "Bid not found");
  }

  if (bid.farmer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot accept this bid");
  }

  if (bid.status !== "PENDING") {
    throw new ApiError(400, "This bid is no longer pending");
  }

  const crop = await Crop.findById(bid.crop);

  if (!crop || crop.status !== "AVAILABLE") {
    throw new ApiError(400, "Crop is no longer available");
  }

  if (bid.quantity > crop.quantity) {
    throw new ApiError(400, "Insufficient crop quantity");
  }

  // MVP rule: accepting a bid sells the entire listed crop.
  // Partial quantity sales are not implemented yet.
  crop.status = "SOLD";
  await crop.save();

  bid.status = "ACCEPTED";
  await bid.save();

  // Reject other pending bids for the same crop
  await Bid.updateMany(
    {
      crop: crop._id,
      _id: { $ne: bid._id },
      status: "PENDING",
    },
    { $set: { status: "REJECTED" } }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, bid, "Bid accepted successfully"));
});

// Farmer rejects a bid
const RejectBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;

  const bid = await Bid.findById(bidId);

  if (!bid) {
    throw new ApiError(404, "Bid not found");
  }

  if (bid.farmer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You cannot reject this bid");
  }

  if (bid.status !== "PENDING") {
    throw new ApiError(400, "This bid is no longer pending");
  }

  bid.status = "REJECTED";
  await bid.save();

  return res
    .status(200)
    .json(new ApiResponse(200, bid, "Bid rejected successfully"));
});

export {
  CreateBid,
  GetMyBids,
  GetFarmerBids,
  AcceptBid,
  RejectBid,
};
