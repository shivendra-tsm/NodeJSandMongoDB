const express = require("express");
const { HelloFun, Register, Login } = require("./controller/userController");
const { saveBlog, getBlogs, getBlogById, updateBlog, deleteBlog } = require("./controller/blogController");
const authMiddleware = require("./middleware/authMiddleware");
const upload = require("./FileUpload");
const route = express.Router();

route.get("/hello",HelloFun);


route.post("/register",Register);
route.post("/login",Login);



route.post("/saveblog",authMiddleware,upload.single("img"),saveBlog);
route.get("/getblogs",authMiddleware,getBlogs);
route.get("/getblogbyid",authMiddleware,getBlogById);
route.put("/updateblog/:id",authMiddleware,upload.single("img"),updateBlog);
route.delete("/deleteblog/:id",authMiddleware,deleteBlog);



module.exports=route