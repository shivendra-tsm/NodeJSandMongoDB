const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const env = require("dotenv");
env.config();
const port = process.env.PORT || 8000;
const userRoute = require("./route")
const Error = require("./middleware/ErrorHandler");

mongoose.connect(process.env.DATABASE_URL).then(()=> {
    console.log("Database connected")
})

app.use(express.json())

app.use(cors({
    origin:"*"
}))

app.use("/api/user",userRoute)

app.use(Error);

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})


