import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const BuyerRequirementSchema = new Schema(
    {
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "Buyer",
            required: true
        },
        cropName: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        quality: {
            type: String,
            required: true,
            trim: true
        },
        targetPrice: {
            type: Number,
            required: true,
            min: 0
        },
        address: {
            type: Schema.Types.ObjectId,
            ref: "Address",
            required: true
        },
        description: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: ["OPEN", "FULFILLED", "CANCELLED"],
            default: "OPEN"
        }
    },
    { timestamps: true }
);

BuyerRequirementSchema.plugin(mongooseAggregatePaginate);

export const BuyerRequirement = mongoose.model(
    "BuyerRequirement",
    BuyerRequirementSchema
);