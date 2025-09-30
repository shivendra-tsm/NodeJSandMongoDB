const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    imgUrl:{
        type:String
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    created_at:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("blog",blogSchema);