import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const BuyerSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        businessName: {
            type: String,
            required: true,
            trim: true
        },
        buyerUnique: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        buyerPhone: {
            type: String,
            required: true,
            trim: true
        },
        businessEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        businessType: {
            type: String,
            enum: ["WHOLESALER", "RETAILER", "PROCESSOR", "OTHER"],
            default: "OTHER"
        },
        status: {
            type: String,
            enum: ["PENDING", "ACTIVE", "REJECTED", "SUSPENDED"],
            default: "ACTIVE"
        }
    },
    { timestamps: true }
);

BuyerSchema.plugin(mongooseAggregatePaginate);
export const Buyer = mongoose.model("Buyer", BuyerSchema);