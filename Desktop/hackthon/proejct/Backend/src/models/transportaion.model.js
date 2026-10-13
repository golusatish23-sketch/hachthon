
import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const TransportationSchema = new Schema(
  {
    transporter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    crop: {
      type: Schema.Types.ObjectId,
      ref: "Crop",
      default: null,
    },

    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Buyer",
      default: null,
    },

    vehicleType: {
      type: String,
      enum: ["TRACTOR", "PICKUP", "TRUCK", "MINI_TRUCK", "OTHER"],
      required: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    fromAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    toAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    estimatedDistance: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedTime: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "BOOKED",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "AVAILABLE",
    },
  },
  { timestamps: true }
);

TransportationSchema.plugin(mongooseAggregatePaginate);

export const Transportation = mongoose.model(
  "Transportation",
  TransportationSchema
);
