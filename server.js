const app = require("./index");
const env = require("dotenv");
const mongoose = require("mongoose");
env.config();
const port = process.env.PORT || 8000;

mongoose.connect(process.env.DATABASE_URL).then(()=> {
    console.log("Database connected")
})

app.listen(port,()=>{
    console.log(`server is running on ${port}`)
})