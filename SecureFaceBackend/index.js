import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from './app.js';

dotenv.config({});

const PORT = process.env.PORT || 3000;

// Database Connection
connectDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`⚙️ Server is running at port : ${PORT}`);
    });
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
