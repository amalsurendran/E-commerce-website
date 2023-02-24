const express = require("express");
const user_route = express();
const userController = require('../Controller/userController');
const cartController = require('../Controller/cartController')
const orderController = require('../Controller/orderController')
const categoryController = require('../Controller/categoryController')
user_route.set('views', './views/user')
const session = require('express-session');
const config = require('../config/config')
const auth = require('../middeleware/Auth');
const Razorpay=require('razorpay')
var instance = new Razorpay({ key_id: config.key_id, key_secret: config. key_secret})



user_route.use(express.json());
user_route.use(express.urlencoded({
    extended: true
}))

user_route.use(session({
    saveUninitialized: false,
    secret: (config.sessionSecret),
    resave: false,

}));



user_route.use(auth.cache)
   


user_route.get('/home', auth.isLogin, userController.loadhome)
user_route.get('/', userController.loadhome)
user_route.get('/login', auth.isLogout, userController.loginLoad)
user_route.get('/signup', userController.loadsignup)
user_route.post('/verify', userController.insertUser)
user_route.get('/verify', userController.loadverify)
user_route.post('/otp-verification', userController.otpverify)
user_route.post('/home', userController.verifyLogin)
user_route.post('/resend', userController.otpredsend)
user_route.get('/resend', userController.loadresend)
user_route.get('/send/:email/:mobile', userController.resendotp)
user_route.get('/send', userController.loadSend)
user_route.get('/product-view',userController.productview)
user_route.get('/logout', userController.userLogout)
user_route.get('/user-profile', userController.LoadUserprofile)
user_route.post('/user-profile',userController.updateProfile)
user_route.get('/address', userController.loadAddress)
user_route.post('/address', userController.addAddress)
user_route.get('/password-change', userController.loadPasswordchange)
user_route.post('/password-change', userController.changePassword)
user_route.get('/delete-address',userController.deleteAddress)
user_route.get('/cart',cartController.loadCart)
user_route.get('/addtocart',auth.isLogin ,cartController.addToCart);
user_route.delete('/removeproduct/:id',cartController.removeCartProduct)
user_route.get('/checkoutaddress',cartController.loadcart)
user_route.post('/checkout',cartController.checkOut)
user_route.post('/checkoutaddress',cartController.checkoutAddress)
user_route.post('/place-order',cartController.placeOrder)
user_route.get('/order',orderController.loadOrder)
user_route.get('/single-order',orderController.loadsingleorder)
user_route.get('/cancel-order',orderController.cancelOrder)
user_route.get('/viewproducts',orderController.viewShopProducts)
user_route.get('/shop-category',categoryController.loadshopcategory)
user_route.get('/forget-password',userController.loadforgetpassword)
user_route.get('/success',orderController.successorder)
user_route.get('/404',userController.load404)
user_route.post('/forget-password', userController.resendotp)

user_route.post('/create/orderId',(req,res)=>{
    console.log("Create OrderId Request",req.body)
    var options = {
      amount: req.body.amount,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "rcp1"
    };
    instance.orders.create(options, function(err, order) {
      console.log(order);
      res.send({orderId:order.id});//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
    });
});

user_route.post("/api/payment/verify",(req,res)=>{

    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
   
     var crypto = require("crypto");
     var expectedSignature = crypto.createHmac('sha256',config. key_secret)
                                     .update(body.toString())
                                     .digest('hex');
                                     console.log("sig received " ,req.body.response.razorpay_signature);
                                     console.log("sig generated " ,expectedSignature);
     var response = {"signatureIsValid":"false"}
     if(expectedSignature === req.body.response.razorpay_signature)
      response={"signatureIsValid":"true"}
         res.send(response);
     });
    

module.exports = user_route;