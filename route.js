const express = require("express");
const { HelloFun } = require("./controller");
const route = express.Router();

route.get("/hello",HelloFun);

module.exports=route