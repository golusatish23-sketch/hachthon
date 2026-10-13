import "dotenv/config"
import dns from "node:dns";
dns.setServers(["8.8.8.8"]);
import { connectCloudinary } from "./utils/cloudnairy.js";
connectCloudinary()
import connectDB from "./db/index.js"
import express from "express"
import app from "./app.js"

connectDB()
.then(()=>{
    
     const server=app.listen(process.env.PORT||8000,()=>{
        console.log(`server is running at port ${process.env.PORT || 8000}`);
    })
    server.on("error",(err)=>{
        console.log(err);
    })
})
.catch((err)=>{
    console.log("monGo data connection failed",err)
})
