import express from "express"
import dotenv, { config } from 'dotenv'
import cors from "cors"
import userRouter from "./routes/user.routes.js"


const app = express()
dotenv.config({})


app.use(express.json());
app.use(cors({
    origin: "*", 
    credentials: true
}));


app.use("/api/users",userRouter) 

export {app};

