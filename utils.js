const jwt = require("jsonwebtoken");
const env = require("dotenv")

env.config();
const bcrypt = require('bcrypt');

const createToken = (data) => {
   return jwt.sign(data,process.env.JWT_SECRET,{expiresIn:'90d'});
}

const verifyToken = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET);
}

const hashPassword = async (pass) =>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass,salt);
    return hashedPassword;
}

const verifyPasswrod = async(password,hashedPassword) => {
    return await bcrypt.compare(password,hashedPassword);
} 

module.exports = {
    createToken,
    verifyToken,
    hashPassword,
    verifyPasswrod
}