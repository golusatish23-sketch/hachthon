import { Address} from "../models/address.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

const AddAddresss=asyncHandler(async (req,res) => {   
    const {city,pincode,state,near,distric,villagename}=req.body
     console.log(req.body)
    if([city,pincode,state,near,distric,villagename,buildingname].some((s)=>(!s||String(s).trim()===""))){
        throw new ApiError(400,"All field are required")
    }
    const address=await Address.create({
        user:req.user?._id,
        city,
        pincode,
        state,
        near,
        distric,
        villagename,

    })
    if(!address){
        throw new ApiError(500,"address create failed")
    }

    return res
    .status(201)
    .json(new ApiResponse(
        201,
        {address},
        "Adress create successfully"
    ))

})

const UpdateAddress=asyncHandler(async (req,res) => {
    const {_id,city,pincode,state,near,distric,villagename,builidingname}=req.body
    const update={}
    Object.entries(req.body).forEach(([key ,value  ])=>{
        if(key==="_id") return;
        if(typeof value==="string"){
            const trimmed=value.trim();
            if(trimmed){
                update[key]=trimmed
            }
            return
        }
        if(value !==null){
            update[key]=value
        }

    })
    const address=await Address.findByIdAndUpdate(
        {_id},
        {$set:update},
        {new :true}
     )
    if(!address){
        throw new ApiError(404,"Address not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,
        {address},
        "Adrress update scuessfully"
    ))

})

const DeleteAddress=asyncHandler(async (req,res) => {
    const {_id}=req.params
    const address=await Address.findOneAndDelete({_id})
    if(!address){
        throw new ApiError(404,"adress not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {address},
        "Adress delete sucessfully"
        )
    )
})

const DefaultAddress=asyncHandler(async (req,res) => {
    const {_id}=req.params
    if(!_id){
        throw new ApiError(400,"please select address")
    }
            await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
        );
    const addressdefault=await Address.findByIdAndUpdate(
        _id,
        {$set:{
            isDefault:true
        }},
        {new:true}
    )
    if(!addressdefault){
        throw new ApiError(404,"Address not found")
    }
    return res.
    status(200)
    .json( new ApiResponse(
        200,
        {addressdefault},
        "Address Update suceefully"
    ))

})

const getAlladdress=asyncHandler(async (req,res) => {
    const address=await Address.find({user:req.user?._id})

    return res
    .status(200)
    .json(new ApiResponse(200,
        {Address:address}
    ),
    "All address get successfully"
)
})



export {
    AddAddresss,
    UpdateAddress,
    DeleteAddress,
    DefaultAddress,
    getAlladdress

}