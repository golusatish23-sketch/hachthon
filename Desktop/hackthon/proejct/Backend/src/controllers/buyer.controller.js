import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Buyer } from "../models/buyer.model.js";
import ApiResponse from "../utils/apiresponse.js";
import { validatePhone } from "../validations/validation.js";
import { User } from "../models/user.model.js";

const CreateBuyer = asyncHandler(async (req, res) => {
    const { businessName, buyerUnique, businessType } = req.body;
    let { businessEmail, buyerPhone } = req.body;

    if ([businessName, buyerUnique].some((s) => !s?.trim())) {
        throw new ApiError(400, "Business name and buyer ID are required");
    }

    if (!buyerPhone) {
        buyerPhone = req.user.phone;
    }

    if (buyerPhone) {
        validatePhone(buyerPhone);
    }

    if (!businessEmail) {
        businessEmail = req.user.email;
    }

    const existingBuyer = await Buyer.findOne({
        owner: req.user._id
    });

    if (existingBuyer) {
        throw new ApiError(400, "You already have a buyer account");
    }

    const buyer = await Buyer.create({
        owner: req.user._id,
        businessName,
        buyerUnique,
        buyerPhone,
        businessEmail,
        businessType,
        status: "PENDING"
    });

    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { role: "buyer" } },
        { new: true }
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            { buyer },
            "Buyer account created successfully"
        )
    );
});

const UpdateBuyer = asyncHandler(async (req, res) => {
    const { businessEmail, businessName, buyerPhone, businessType } = req.body;
    const updateData = {};

    if (businessName?.trim()) {
        updateData.businessName = businessName.trim();
    }

    if (buyerPhone) {
        validatePhone(buyerPhone);
        updateData.buyerPhone = buyerPhone;
    }

    if (businessEmail?.trim()) {
        updateData.businessEmail = businessEmail.trim().toLowerCase();
    }

    if (businessType) {
        updateData.businessType = businessType;
    }

    const buyer = await Buyer.findOneAndUpdate(
        { owner: req.user._id },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!buyer) {
        throw new ApiError(404, "Buyer account not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { buyer }, "Buyer updated successfully")
    );
});

const GetAllBuyers = asyncHandler(async (req, res) => {
    const buyers = await Buyer.find({ status: "ACTIVE" });

    return res.status(200).json(
        new ApiResponse(200, { buyers }, "Active buyers fetched successfully")
    );
});

const PendingBuyers = asyncHandler(async (req, res) => {
    const buyers = await Buyer.find({ status: "PENDING" });

    return res.status(200).json(
        new ApiResponse(200, { buyers }, "Pending buyers fetched successfully")
    );
});

const MakeActiveBuyer = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    if (!_id) {
        throw new ApiError(400, "Please select a buyer");
    }

    const buyer = await Buyer.findByIdAndUpdate(
        _id,
        { $set: { status: "ACTIVE" } },
        { new: true, runValidators: true }
    );

    if (!buyer) {
        throw new ApiError(404, "Buyer not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { buyer }, "Buyer activated successfully")
    );
});

export {
    CreateBuyer,
    UpdateBuyer,
    GetAllBuyers,
    PendingBuyers,
    MakeActiveBuyer
};