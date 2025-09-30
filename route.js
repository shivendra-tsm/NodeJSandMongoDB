const express = require("express");
const { HelloFun, Register, Login } = require("./controller/userController");
const { saveBlog } = require("./controller/blogController");
const authMiddleware = require("./middleware/authMiddleware");
const upload = require("./FileUpload");
const route = express.Router();

route.get("/hello",HelloFun);


route.post("/register",Register);
route.post("/login",Login);


route.post("/saveblog",authMiddleware,upload.single("img"),saveBlog);

module.exports=route