
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId
const productsSchema = new mongoose.Schema({


    name:{
        type:String,
        required:true
    },
    category:{
        type:ObjectId,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    soft_delete:{
        type:Boolean,
        default:false
    },
    quantity:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('Product',productsSchema);