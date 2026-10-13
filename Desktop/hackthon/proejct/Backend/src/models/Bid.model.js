import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const BidSchema = new Schema(
    {
        crop: {
            type: Schema.Types.ObjectId,
            ref: "Crop",
            required: true
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "Buyer",
            required: true
        },
        farmer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        offeredPrice: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        message: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "REJECTED",
                "CANCELLED"
            ],
            default: "PENDING"
        }
    },
    { timestamps: true }
);

BidSchema.plugin(mongooseAggregatePaginate);

export const Bid = mongoose.model("Bid", BidSchema);