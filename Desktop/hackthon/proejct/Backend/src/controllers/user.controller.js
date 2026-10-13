import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/apiresponse.js";
import uploadcloudnairy, { Deletefromcloudnair } from "../utils/cloudnairyconfig.js";
import jwt from 'jsonwebtoken';
import fs from "fs";
import { OAuth2Client, PassThroughClient } from "google-auth-library";
const client=new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateAcessAndRefreshtoken=async(userId)=>{
    try{
       const user= await User.findById(userId);
     const Acesstoken=  user.generatAccessToken()
      const refreshToken= user.generatRefreshToken()
      user.refreshToken=refreshToken
     await user.save({validateBeforeSave:false})
     return {Acesstoken,refreshToken}
    }catch(error){
        throw new ApiError(500,"something went wrong while refresh and acess token")
    }
}
const continuewithGoogle=asyncHandler(async (req,res) => {
    const {token}=req.body
        console.log("Route hit");
    console.log(req.body);
    const ticket=await client.verifyIdToken({
        idToken:token,
        audience:process.env.GOOGLE_CLIENT_ID
    })
    console.log(token);
    const payload=ticket.getPayload();
    const {email,email_verified,name,sub,picture}=payload;
    if(!email_verified){
        throw new ApiError(401,"Google email not verified")

    }
    let user=await User.findOne({email});
    if(!user){
        const usernamegenerate=
        user=await User.create({
            email,
            username:`${email.split("@")[0]}${Date.now()}`,
            fullName:name,
            avatar:picture,
            googleId:sub,
            password:`google_${sub}`

        })
    }
    const {Acesstoken,refreshToken}=await generateAcessAndRefreshtoken(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -googleId -refreshToken")
    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",Acesstoken,option)
    .cookie("refreshtoken",refreshToken,option)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,Acesstoken,refreshToken
            },
            "User logged in sucessfully"
        )
    )
})

const updatecoverImage=asyncHandler(async (req,res) => {
 
    const coverImagelocalPath=req.file?.path
    if(!coverImagelocalPath){
        throw new ApiError(400,"coverImage file is missing")
    }
    console.log("coverimage",coverImagelocalPath);


    const coverImage=await uploadcloudnairy(coverImagelocalPath)
   
    const photo=await User.findById(req.user?._id)
    let deleteAvatar=null
    if(photo.coverImage_id !==""){
        deleteAvatar=await Deletefromcloudnair(photo.coverImage_id)
        if (deleteAvatar.result !== "ok") {
            throw new ApiError("Failed to delete image from Cloudinary");
        }
    }

    if(!coverImage.url){
        throw new ApiError(400,"Error while uplaoding on coverimage")
    }
   const user= await User.findByIdAndUpdate(req.user?._id,
        {$set:{
            coverImage:coverImage.url,
            coverImage_id:coverImage.public_id

        }}
        ,{new:true}).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"CoverImage update sucessfully"))

    
})
const Updateavatar=asyncHandler(async (req,res) => {
    const avatarlocalPath=req.file?.path
    if(!avatarlocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }
    const avatar=await uploadcloudnairy(avatarlocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uplaoding on avatar")
    }
    const photo=await User.findById(req.user?._id)

    const deleteAvatar=await Deletefromcloudnair(photo.avatar_id)


    if (deleteAvatar.result !== "ok") {
    throw new ApiError("Failed to delete image from Cloudinary");
    }

    const user= await User.findByIdAndUpdate(req.user?._id,
        {$set:{
            avatar:avatar.url,
            avatar_id:avatar.public_id

        }}
        ,{new:true}).select("-password")
        console.log("user haa",user)
    return res
    .status(200)
    .json(new ApiResponse(200,{user},"Avatar update sucessfully"))

})
const logoutUser=asyncHandler(async(req,res)=>{
 const logout=  await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
    },{
        new:true
    }
)
 const option={
    httpOnly:true,
    secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken", option)
   .clearCookie("refreshToken", option)
   .json(new ApiResponse(200,{logout},"User logged out"))
})
const loginUser=asyncHandler(async (req,res) => {
    const {email,password}=req.body
    const user= await User.findOne({email})
    if(!user){
        throw new ApiError(404,"usernot exist");
    }
    const passwordcheck=await user.ispasswordCorrect(password);
    if(!passwordcheck){
        throw new ApiError(404,"password is incorrect")
    }
    const {Acesstoken,refreshToken}=await generateAcessAndRefreshtoken(user._id)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
const option = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};
    // await sendEmail(email)
    console.log("email aaa rah ah haa",email)
    return res
    .status(200)
    .cookie("accessToken",Acesstoken, option)
    .cookie("refreshToken",refreshToken, option)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,Acesstoken,refreshToken
            },
            "user logged in successfully"
        )
    )
})

const createUser=asyncHandler(async (req,res) => {
    const {email,fullName,username,password}=req.body
    if([email,fullName,username,password].some((field)=>field?.trim()===""))
    {
        throw new ApiError(400,"All field are required")
    }
    const avatarlocalPath=req.file?.path
    if(!avatarlocalPath){
        throw new ApiError(404,"Avatar is required")
    }
    const avatar=await uploadcloudnairy(avatarlocalPath)
    if(!avatar.url){
        throw new ApiError(400,"upload cludnairy problem")
    }
    const user=await User.create({
        fullName,
        username,
        email,
        password,
        avatar:avatar.url,
        avatar_id:avatar.public_id
    })
    const {Acesstoken,refreshToken}=await generateAcessAndRefreshtoken(user._id)
    const findUser=await User.findById(user._id).select("-password -refeshToken")
  
    const option = {
        httpOnly: true,
        secure: true,
        sameSite: "strict"
    };
    return res
    .status(200)
    .cookie("accessToken",Acesstoken, option)
    .cookie("refreshToken",refreshToken, option)
    .json(
        new ApiResponse(
            200,{
                user:findUser,Acesstoken,refreshToken
            },
            "user logged in successfully"
        )
    )
    
})
const GetAllUser=asyncHandler(async (req,res) => {
    const AllUser=await User.find();
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {AllUser},
        "sucessfully finad all user"
    ))
    
})
const DeleteSingleUser=asyncHandler(async (req,res) => {
    const {_id}=req.params
    const deleteUser=await User.findOneAndDelete({_id})
    if(!deleteUser){
        throw new ApiError(404,"User not dound")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,
        {deleteUser},
        "User delete sucessfully"
    ))
    
})

const BlockUser=asyncHandler(async (req,res) => {
    const {_id}=req.params
    if(!_id){
        throw new ApiError(400,"user not avilable")
    }

    const user=await User.findById(_id);
    if(!user){
        throw new ApiError(404,"User not found")
    }
    if(user.status==="BLOCKED"){
        throw new ApiError(404,"User Already Blocked")
    }
    const userblocked=await User.findByIdAndUpdate(
        _id,
        {$set:{
            status:"BLOCKED"
        }},
        {new:true}
    )
    if(!userblocked){
        throw new ApiError(400,'user not found')
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {userblocked},
        "user blocked successfully"
    ))
})
const UnBlockUser=asyncHandler(async (req,res) => {
    const {_id}=req.params
    if(!_id){
        throw new ApiError(400,"user not avilable")
    }

    const user=await User.findById(_id);
    if(!user){
        throw new ApiError(404,"User not found")
    }
    if(user.status==="ACTIVE"){
        throw new ApiError(404,"User Already Active")
    }
    const userblocked=await User.findByIdAndUpdate(
        _id,
        {$set:{
            status:"ACTIVE"
        }},
        {new:true}
    )
    if(!userblocked){
        throw new ApiError(400,'user not found')
    }
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {userblocked},
        "user blocked successfully"
    ))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      req.user,
      "Current user fetched successfully"
    )
  );
});
const refreshTokeenfun=asyncHandler(async (req,res) => {
    const {refreshToken}=req.cookies
    console.log(req.cookies)
    if(!refreshToken){
        throw new ApiError(406,"Unauthorized")
    }
    const decodeToken=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodeToken?._id).
    select("-password -refreshToken")
    if (!user) {
    throw new ApiError(401, "Invalid refresh token");
}
    const Acesstoken=  user.generatAccessToken()
    const option = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};
    return res
    .status(200)
    .cookie("accessToken",Acesstoken,option)
    .json(new ApiResponse(200,
        {},
        "ascss tokesn refresh"
    ))

})
export {
    continuewithGoogle, 
    updatecoverImage,
    Updateavatar,
    logoutUser,
    loginUser,
    createUser,
    GetAllUser,
    DeleteSingleUser,
    BlockUser,
    UnBlockUser,
    getCurrentUser,
    refreshTokeenfun
}
