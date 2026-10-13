import mongoose,{Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const UserSchema=new Schema({
    username:{
        type:String,
        required:[true ,"username is required"],
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        lowercase:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    
    },
    avatar:{
        type:String,
        required:true,
        trim:true,

    },
    avatar_id:{
        type:String,
        
    },
    coverImage:{
        type:String,
        
    },
    coverImage_id:{
        type:String,
        default: ""
    },
    password:{
        type:String,
        required: function () {
        return !this.googleId;
        }
    },
    googleId:{
        type:String,
        default:""
    },
    role:{
        type:String,
        enum:["farmer","buyer"],
        default:"farmer"
    },
    phone:{
        type:String,
        trim:true,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCKED"],
        default: "ACTIVE"
    },
    refreshToken:{
        type:String
    }
  
},{timestamps:true}
)
UserSchema.pre("save",async function (next) {
    console.log("idmodified",this.isModified("password"))
    if(!this.isModified("password")) return ;
    console.log("this_passwordin save  mongoose",this.password)
    this.password= await bcrypt.hash(this.password,10);   
})
UserSchema.methods.ispasswordCorrect=async function (password) {

  return await bcrypt.compare(password,this.password)
    
}
UserSchema.methods.generatAccessToken=function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
UserSchema.methods.generatRefreshToken=function(){
 return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
export const User=mongoose.model("User",UserSchema) 