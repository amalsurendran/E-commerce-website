const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
        
    },
    status:{
        type:Boolean,
        default:false
    },
    default:{
        type:Boolean,
        default:false
    }
});

module.exports = mongoose.model('Banner',bannerSchema);