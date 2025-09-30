const express = require("express");
const { HelloFun, Register, Login } = require("./controller");
const route = express.Router();

route.get("/hello",HelloFun);

route.post("/register",Register);
route.post("/login",Login);

module.exports=route