import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CropSchema = new Schema(
    {
        farmer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        address: {
            type: Schema.Types.ObjectId,
            ref: "Address",
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
        expectedPrice: {
            type: Number,
            required: true,
            min: 0
        },
        image: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["AVAILABLE", "SOLD", "INACTIVE"],
            default: "AVAILABLE"
        }
    },
    { timestamps: true }
);

CropSchema.plugin(mongooseAggregatePaginate);

export const Crop = mongoose.model("Crop", CropSchema);