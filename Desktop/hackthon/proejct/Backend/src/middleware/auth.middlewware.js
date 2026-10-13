import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/apiresponse.js";



export const verifyjwt =asyncHandler(async(req,res,next)=>{

try {
  
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("bearer","")
    if(!token){
        throw new ApiError(401,"Unauthorized Request")
    }
     const decodeToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
     const user=await User.findById(decodeToken?._id).
     select("-password -refreshToken")
     
    if(!user){
        throw new ApiError(401,"Invalid Acesss Token")
    }
    if(user.status==="BLOCKED"){
        return res
        .status(403)
        .json(new ApiResponse(
            403,
            {user},
            "you are blocked"
        ))
    }
    req.user=user;
    next()
}
catch (error) {
    throw new ApiError(401,error?.message||"invalid Acess token")
}
})
export const verifyrole= asyncHandler(async (req,res,next) => {
    try{
        const checksellerrole=await User.findOne({
            _id:req.user._id
        })
        if(!checksellerrole){
            throw new ApiError(404,"User not found")
        }
        if(checksellerrole.role !== "seller"){
            throw new ApiError(403,"you are not a seller")
        }


        const seller = await Shop.findOne({ owner: req.user?._id })
        req.seller=seller
        next()

    }
    catch(error){
        throw new ApiError(403,"you are not seller")
    }
    
})
export const verifyadmin= asyncHandler(async (req,res,next) => {
    try{
        const admin=await User.findOne({
            _id:req.user._id
        })
        if(!admin){
            throw new ApiError(404,"User not found")
        }

        if(admin.role !== "admin"){
            throw new ApiError(403,"you are not a admin")
        }
        req.admin=admin
        next()
    }
    catch(error){
        throw new ApiError(403,"you are not admin")
    }
    
})
