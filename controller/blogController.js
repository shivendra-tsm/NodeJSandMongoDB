const ErrorHandler = require("../middleware/ErrorHandlingClass");
const blogSchema = require("../models/blogModel")

const saveBlog = async(req, res, next) => {
    try{
        const {title, content} = req.body;
    if(!title || !content) {
        return next(new ErrorHandler("All fields required",400));
    }
    const id = req.id;
    console.log(req.file);
    const imgUrl = req.file? req.file.filename : "";
    const blog = await blogSchema.create({
        title:title,
        content:content,
        imgUrl:imgUrl,
        author:id
    })

    if(!blog) {
        return next(new ErrorHandler("blog creation failed",400));
    }
    return res.status(201).json({
        success:true,
        message:"blog created successfully",
        blog
    })

    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500));
    }

}

module.exports = {
    saveBlog
}