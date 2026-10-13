import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiResponse from "../utils/apiresponse.js";
import { BuyerRequirement } from "../models/buyerRequirement.model.js";
import { Buyer } from "../models/buyer.model.js";
import { Address } from "../models/address.model.js";

const CreateRequirement = asyncHandler(async (req, res) => {
    const { cropName, quantity, quality, targetPrice, address, description } = req.body;

    if (
        !cropName?.trim() ||
        quantity === undefined ||
        !quality?.trim() ||
        targetPrice === undefined ||
        !address
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (
        !Number.isFinite(Number(quantity)) ||
        Number(quantity) <= 0 ||
        !Number.isFinite(Number(targetPrice)) ||
        Number(targetPrice) < 0
    ) {
        throw new ApiError(400, "Invalid quantity or target price");
    }

    const buyer = await Buyer.findOne({
        owner: req.user._id,
        status: "ACTIVE"
    });

    if (!buyer) {
        throw new ApiError(403, "Active buyer account required");
    }

    const buyerAddress = await Address.findOne({
        _id: address,
        user: req.user._id
    });

    if (!buyerAddress) {
        throw new ApiError(404, "Your address was not found");
    }

    const requirement = await BuyerRequirement.create({
        buyer: buyer._id,
        cropName: cropName.trim(),
        quantity: Number(quantity),
        quality: quality.trim(),
        targetPrice: Number(targetPrice),
        address,
        description: description?.trim() || ""
    });

    return res.status(201).json(
        new ApiResponse(201, { requirement }, "Requirement created successfully")
    );
});

const GetMyRequirements = asyncHandler(async (req, res) => {
    const buyer = await Buyer.findOne({ owner: req.user._id });

    if (!buyer) {
        throw new ApiError(404, "Buyer account not found");
    }

    const requirements = await BuyerRequirement.find({
        buyer: buyer._id
    }).populate("address");

    return res.status(200).json(
        new ApiResponse(200, { requirements }, "Your requirements fetched successfully")
    );
});

const GetOpenRequirements = asyncHandler(async (req, res) => {
    const requirements = await BuyerRequirement.find({
        status: "OPEN"
    })
        .populate("buyer", "businessName businessType")
        .populate("address");

    return res.status(200).json(
        new ApiResponse(200, { requirements }, "Open requirements fetched successfully")
    );
});

const UpdateRequirement = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const { cropName, quantity, quality, targetPrice, address, description } = req.body;

    const buyer = await Buyer.findOne({ owner: req.user._id });

    if (!buyer) {
        throw new ApiError(404, "Buyer account not found");
    }

    const requirement = await BuyerRequirement.findOne({
        _id,
        buyer: buyer._id,
        status: "OPEN"
    });

    if (!requirement) {
        throw new ApiError(404, "Open requirement not found");
    }

    if (cropName !== undefined) {
        if (!cropName.trim()) throw new ApiError(400, "Invalid crop name");
        requirement.cropName = cropName.trim();
    }

    if (quantity !== undefined) {
        if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
            throw new ApiError(400, "Invalid quantity");
        }
        requirement.quantity = Number(quantity);
    }

    if (quality !== undefined) {
        if (!quality.trim()) throw new ApiError(400, "Invalid quality");
        requirement.quality = quality.trim();
    }

    if (targetPrice !== undefined) {
        if (!Number.isFinite(Number(targetPrice)) || Number(targetPrice) < 0) {
            throw new ApiError(400, "Invalid target price");
        }
        requirement.targetPrice = Number(targetPrice);
    }

    if (address !== undefined) {
        const buyerAddress = await Address.findOne({
            _id: address,
            user: req.user._id
        });

        if (!buyerAddress) throw new ApiError(404, "Address not found");
        requirement.address = address;
    }

    if (description !== undefined) {
        requirement.description = description.trim();
    }

    await requirement.save();

    return res.status(200).json(
        new ApiResponse(200, { requirement }, "Requirement updated successfully")
    );
});

const CancelRequirement = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    const buyer = await Buyer.findOne({ owner: req.user._id });

    if (!buyer) {
        throw new ApiError(404, "Buyer account not found");
    }

    const requirement = await BuyerRequirement.findOneAndUpdate(
        {
            _id,
            buyer: buyer._id,
            status: "OPEN"
        },
        { $set: { status: "CANCELLED" } },
        { new: true }
    );

    if (!requirement) {
        throw new ApiError(404, "Open requirement not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { requirement }, "Requirement cancelled successfully")
    );
});

export {
    CreateRequirement,
    GetMyRequirements,
    GetOpenRequirements,
    UpdateRequirement,
    CancelRequirement
};