const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    blocked:{
        type:Boolean,
        default:false
    },
    token:{
       type:Number,
       default:false
    }, Address: [{
        name: { type: String, required: true },
        number: { type: String, required: true },
        house: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        delivery_point:{type:String,required:true}
    }],
    cart:[{
        productId:{type:ObjectId},
        _id:false
    }],
    wishlist: [{
        productId: { type: ObjectId }

    }],
    wallet: {
        type: Number,
        default:0
    },


});

module.exports = mongoose.model('User',userSchema)