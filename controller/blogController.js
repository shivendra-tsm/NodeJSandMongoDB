const ErrorHandler = require("../middleware/ErrorHandlingClass");
const blogSchema = require("../models/blogModel")
const fs = require("fs");
const path = require("path")

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


const getBlogs = async(req,res,next) =>{
    try{
        const blogs = await blogSchema.find().populate("author","name -_id");
        if(blogs.length === 0) {
            return next(new ErrorHandler("No blog found",404));
        }
        return res.status(200).json({
            success:true,
            message:"blog fetched successfully",
            data:blogs
        })
    } catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500));
    }
}


const getBlogById = async(req,res,next) => {
    try{
        const id = req.id;
        const blogs = await blogSchema.find({author:id});
        if(blogs.length === 0) {
            return next(new ErrorHandler("No blogs found",404));
        }
        return res.status(200).json({
            success:true,
            message:"blogs fetched",
            data:blogs
        })
    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500));
    }
}

const updateBlog = async(req,res,next) => {

    try{

        const {title, content} = req.body;
        const {id} = req.params;
        const author_id = req.id;

        const blog = await blogSchema.findById(id);
        if(!blog) {
            return next(new ErrorHandler("No blog found",404));
        }

         if(author_id != blog.author) {
            return next(new ErrorHandler("Invalid access",401));
         }

        if (req.file && blog.imgUrl) {
          const oldImagePath = path.join("uploads", blog.imgUrl);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.imgUrl = req.file ? req.file.filename : blog.imgUrl;

        await blog.save()
        return res.status(200).json({
            success:true,
            message:"blog updated successfully",
            data:blog
        })

    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500));
    }
}


const deleteBlog = async(req,res, next) => {
    try {
        const {id} = req.params;
        const author_id = req.id;
        const blog = await blogSchema.findById(id);
        if(!blog) {
            return next(new ErrorHandler("No blog found",404));
        }
         
         if(author_id != blog.author) {
            return next(new ErrorHandler("Invalid access",401));
         }

        if (blog.imgUrl) {
          const oldImagePath = path.join("uploads", blog.imgUrl);
          fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
          });
        }

        await blogSchema.findByIdAndDelete(id);
        return res.status(200).json({
            success:true,
            message:"blog deleted"
        })
        
    }catch(err) {
        return next(new ErrorHandler(err.message || "Internal server error",500));
    }
}

module.exports = {
    saveBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
}