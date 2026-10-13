import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const AddressSchema= new Schema( 
    {
        user:{
            type:Schema.Types.ObjectId
            ,ref:"User",
            required:true
        },
        city:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        near:{
            type:String,
            required:true
        },
        distric:{
            type:String,
            required:true,
            
        },
        villagename:{
            type:String,
            required:true
        },
        isDefault: {
            type: Boolean,
            default: false
            
        },
        latitude: {
            type: Number,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            min: -180,
            max: 180
        },
        isDefault:{
            type:Boolean,
            default:true
        }

    }
,{timestamps:true}
)

AddressSchema.plugin(mongooseAggregatePaginate)
export const Address=mongoose.model("Address",AddressSchema)