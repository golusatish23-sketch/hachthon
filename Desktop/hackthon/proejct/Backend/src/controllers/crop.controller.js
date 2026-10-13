import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import ApiResponse from "../utils/apiresponse.js";
import { Crop } from "../models/crop.model.js";
import { Address } from "../models/address.model.js";

const CreateCrop = asyncHandler(async (req, res) => {
    const {
        address,
        cropName,
        quantity,
        quality,
        expectedPrice,
        image
    } = req.body;

    if (
        !address ||
        !cropName?.trim() ||
        quantity === undefined ||
        !quality?.trim() ||
        expectedPrice === undefined
    ) {
        throw new ApiError(400, "All required fields must be provided");
    }

    if (
        !Number.isFinite(Number(quantity)) ||
        Number(quantity) <= 0 ||
        !Number.isFinite(Number(expectedPrice)) ||
        Number(expectedPrice) < 0
    ) {
        throw new ApiError(400, "Invalid quantity or expected price");
    }

    const findAddress = await Address.findOne({
        _id: address,
        user: req.user._id
    });

    if (!findAddress) {
        throw new ApiError(404, "Address not found for this user");
    }

    const crop = await Crop.create({
        farmer: req.user._id,
        address,
        cropName: cropName.trim(),
        quantity: Number(quantity),
        quality: quality.trim(),
        expectedPrice: Number(expectedPrice),
        image
    });

    return res.status(201).json(
        new ApiResponse(201, { crop }, "Crop added successfully")
    );
});

const GetMyCrops = asyncHandler(async (req, res) => {
    const crops = await Crop.find({
        farmer: req.user._id
    }).populate("address");

    return res.status(200).json(
        new ApiResponse(200, { crops }, "Your crops fetched successfully")
    );
});

const GetAvailableCrops = asyncHandler(async (req, res) => {
    const crops = await Crop.find({
        status: "AVAILABLE"
    })
        .populate("farmer", "name phone")
        .populate("address");

    return res.status(200).json(
        new ApiResponse(200, { crops }, "Available crops fetched successfully")
    );
});

const UpdateCrop = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const { cropName, quantity, quality, expectedPrice, image, address } = req.body;

    const updateData = {};

    if (cropName !== undefined) {
        if (!cropName.trim()) {
            throw new ApiError(400, "Crop name cannot be empty");
        }
        updateData.cropName = cropName.trim();
    }

    if (quantity !== undefined) {
        if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
            throw new ApiError(400, "Quantity must be greater than zero");
        }
        updateData.quantity = Number(quantity);
    }

    if (quality !== undefined) {
        if (!quality.trim()) {
            throw new ApiError(400, "Quality cannot be empty");
        }
        updateData.quality = quality.trim();
    }

    if (expectedPrice !== undefined) {
        if (!Number.isFinite(Number(expectedPrice)) || Number(expectedPrice) < 0) {
            throw new ApiError(400, "Invalid expected price");
        }
        updateData.expectedPrice = Number(expectedPrice);
    }

    if (image !== undefined) {
        updateData.image = image;
    }

    if (address !== undefined) {
        const findAddress = await Address.findOne({
            _id: address,
            user: req.user._id
        });

        if (!findAddress) {
            throw new ApiError(404, "Address not found for this user");
        }

        updateData.address = address;
    }

    const crop = await Crop.findOneAndUpdate(
        { _id, farmer: req.user._id },
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate("address");

    if (!crop) {
        throw new ApiError(404, "Crop not found or you do not own it");
    }

    return res.status(200).json(
        new ApiResponse(200, { crop }, "Crop updated successfully")
    );
});

const DeleteCrop = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    const crop = await Crop.findOneAndDelete({
        _id,
        farmer: req.user._id
    });

    if (!crop) {
        throw new ApiError(404, "Crop not found or you do not own it");
    }

    return res.status(200).json(
        new ApiResponse(200, { crop }, "Crop deleted successfully")
    );
});

export {
    CreateCrop,
    GetMyCrops,
    GetAvailableCrops,
    UpdateCrop,
    DeleteCrop
};