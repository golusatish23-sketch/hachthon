import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet";
import errorHandler from "./middleware/error.middleware.js";

const app=express();
app.use(helmet());
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"50kb"}))
app.use(express.urlencoded({extended:true,limit:"50kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//rouets
import userrouter from "./routes/user.routes.js";





app.use('/api/v1/users',userrouter)
app.use(errorHandler);
export  default app