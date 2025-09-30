const express = require("express");
const app = express();
const cors = require("cors");
const env = require("dotenv");
env.config();
const userRoute = require("./route")
const Error = require("./middleware/ErrorHandler");

app.use(express.json())

app.use(cors({
    origin:"*"
}))

app.use("/api/user",userRoute)

app.use(Error);

module.exports = app;


