const ErrorHandler = require("../middleware/ErrorHandlingClass");
const userSchema = require("../models/userModel");
const { hashPassword, createToken, verifyPasswrod } = require("../utils");

const HelloFun = async(req,res)=> {
    return res.status(200).json({
        success:true,
        message:"Hello World"
    })
}


const Register = async(req,res, next) => {
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password) {
            return next(new ErrorHandler("All fields are required",400));
        }
        const existingUser = await userSchema.findOne({email});
        if(existingUser) {
            return next(new ErrorHandler("This email already exist",409))
        }
        const hashedPassword =await hashPassword(password);
        const user = await userSchema.create({
            name:name,
            email:email,
            password:hashedPassword
        })
        if(!user) {
            return next(new ErrorHandler("Registration failed",400))
        }

        const token = createToken({id:user._id});

        return res.status(201).json({
            success:true,
            message:"Registration successfull",
            token:token
        })

    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500))
    }
}


const Login = async(req,res, next) => {
    try {
        const {email,password} = req.body;
        if(!email || !password) {
            return next(new ErrorHandler("All fields are required",400));
        }
        const user = await userSchema.findOne({email});
        if(!user) {
            return next(new ErrorHandler("No user found",404));
        }

        if(email !== user.email) {
            return next(new ErrorHandler("Invalid email or password",400));
        }

        const pass = await verifyPasswrod(password, user.password);

        if(!pass) {
            return next(new ErrorHandler("Invalid email or password",400));
        }
        const token = createToken({id:user._id});
        return res.status(200).json({
            success:true,
            message:"Logged in successfully",
            token:token
        })
    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500))
    }
}

module.exports={
    HelloFun,
    Register,
    Login
}