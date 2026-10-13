import { Transportation } from "../models/transportation.model.js";
import { Address } from "../models/address.model.js";
import { Buyer } from "../models/buyer.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiresponse.js";

// 1. Register vehicle (Transporter)
const CreateTransportation = asyncHandler(async (req, res) => {
  const {
    vehicleType,
    vehicleNumber,
    capacity,
    fromAddress,
    toAddress,
    price,
    estimatedDistance,
    estimatedTime,
  } = req.body;

  if (
    !vehicleType ||
    !vehicleNumber ||
    capacity == null ||
    !fromAddress ||
    !toAddress ||
    price == null
  ) {
    throw new ApiError(400, "Please provide all required vehicle details");
  }

  if (
    !Number.isFinite(Number(capacity)) ||
    Number(capacity) <= 0 ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    throw new ApiError(400, "Invalid capacity or transportation price");
  }

  const addresses = await Address.find({
    _id: { $in: [fromAddress, toAddress] },
    user: req.user._id,
  });

  if (
    addresses.length !== 2 ||
    fromAddress === toAddress
  ) {
    throw new ApiError(400, "Please provide two different addresses belonging to you");
  }

  const vehicle = await Transportation.create({
    transporter: req.user._id,
    vehicleType,
    vehicleNumber,
    capacity: Number(capacity),
    fromAddress,
    toAddress,
    price: Number(price),
    estimatedDistance:
      estimatedDistance == null ? 0 : Number(estimatedDistance),
    estimatedTime: estimatedTime || "",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, vehicle, "Vehicle registered successfully"));
});

// 2. Get all available vehicles
const GetAvailableTransportation = asyncHandler(async (req, res) => {
  const { fromAddress, toAddress, vehicleType } = req.query;

  const filter = { status: "AVAILABLE" };

  if (fromAddress) filter.fromAddress = fromAddress;
  if (toAddress) filter.toAddress = toAddress;
  if (vehicleType) filter.vehicleType = vehicleType;

  const vehicles = await Transportation.find(filter)
    .populate("transporter", "fullname username")
    .populate("fromAddress")
    .populate("toAddress")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, vehicles, "Available vehicles fetched successfully"));
});

// 3. Transporter sees their vehicles
const GetMyTransportation = asyncHandler(async (req, res) => {
  const vehicles = await Transportation.find({
    transporter: req.user._id,
  })
    .populate("fromAddress")
    .populate("toAddress")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, vehicles, "Your vehicles fetched successfully"));
});

// 4. Update vehicle details (Transporter)
const UpdateTransportation = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;

  const vehicle = await Transportation.findOne({
    _id: vehicleId,
    transporter: req.user._id,
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (vehicle.status !== "AVAILABLE") {
    throw new ApiError(400, "Only available vehicles can be updated");
  }

  const allowedFields = [
    "vehicleType",
    "vehicleNumber",
    "capacity",
    "fromAddress",
    "toAddress",
    "price",
    "estimatedDistance",
    "estimatedTime",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      vehicle[field] = req.body[field];
    }
  }

  if (
    !Number.isFinite(Number(vehicle.capacity)) ||
    Number(vehicle.capacity) <= 0 ||
    !Number.isFinite(Number(vehicle.price)) ||
    Number(vehicle.price) < 0
  ) {
    throw new ApiError(400, "Invalid capacity or price");
  }

  if (
    !["TRACTOR", "PICKUP", "TRUCK", "MINI_TRUCK", "OTHER"].includes(
      vehicle.vehicleType
    )
  ) {
    throw new ApiError(400, "Invalid vehicle type");
  }

  const addresses = await Address.find({
    _id: { $in: [vehicle.fromAddress, vehicle.toAddress] },
    user: req.user._id,
  });

  if (
    addresses.length !== 2 ||
    vehicle.fromAddress.toString() === vehicle.toAddress.toString()
  ) {
    throw new ApiError(400, "Invalid pickup or delivery address");
  }

  await vehicle.save();

  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Vehicle updated successfully"));
});

// 5. Book transportation (Active Buyer)
const BookTransportation = asyncHandler(async (req, res) => {
  const { vehicleId, cropId } = req.body;

  if (!vehicleId) {
    throw new ApiError(400, "Vehicle ID is required");
  }

  const buyer = await Buyer.findOne({
    owner: req.user._id,
    status: "ACTIVE",
  });

  if (!buyer) {
    throw new ApiError(403, "Active buyer profile required");
  }

  const vehicle = await Transportation.findOneAndUpdate(
    {
      _id: vehicleId,
      status: "AVAILABLE",
    },
    {
      $set: {
        status: "BOOKED",
        buyer: buyer._id,
        ...(cropId ? { crop: cropId } : {}),
      },
    },
    { new: true, runValidators: true }
  );

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found or already booked");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Transportation booked successfully"));
});

// 6. Update delivery status (Transporter)
const UpdateDeliveryStatus = asyncHandler(async (req, res) => {
  const { vehicleId } = req.params;
  const { status } = req.body;

  const allowedStatuses = ["IN_TRANSIT", "DELIVERED", "CANCELLED"];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid delivery status");
  }

  const vehicle = await Transportation.findOne({
    _id: vehicleId,
    transporter: req.user._id,
  });

  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  if (
    vehicle.status !== "BOOKED" &&
    vehicle.status !== "IN_TRANSIT"
  ) {
    throw new ApiError(400, "This vehicle has no active delivery");
  }

  vehicle.status = status;
  await vehicle.save();

  return res
    .status(200)
    .json(new ApiResponse(200, vehicle, "Delivery status updated successfully"));
});

export {
  CreateTransportation,
  GetAvailableTransportation,
  GetMyTransportation,
  UpdateTransportation,
  BookTransportation,
  UpdateDeliveryStatus,
};