const user = require('../models/userModel');
const Order = require('../Models/orderModel')
const product = require('../Models/productModel');
const { ObjectId } = require('mongodb');


const loadOrder = async(req,res)=>{
    try {
        const orderData = await Order.find({userId: req.session.user_id}).sort({_id:-1})
        res.render('myOrders',{order:orderData,logged:1})
    } catch (error) {
        console.log(error)
    }
}

const loadsingleorder = async(req,res)=>{
    try {
        const orderData = await Order.find({orderId: req.query.id}).lean();
        // const pID=orderData[0].product[0].id
        
        // console.log(pID,"line 17 orderController")
        res.render('singleorder',{order:orderData , logged:1})//pwer:pID
    } catch (error) {
        console.log(error);
    }
}

const cancelOrder = async (req, res) => {
    try {
         
        const id = req.query.id;
        const orderData = await Order.findById({_id: id}).lean();
        const pID=orderData.product;
        pID.forEach(async(elem,i)=>{const reduceStock=await product.updateOne({_id:elem.id},{
              $inc:{
               quantity:+elem.quantity
               }})})
        if (orderData.status === "Delivered") {
            const returnOrder = await Order.findOneAndUpdate({ _id:id }, {

                $set: {
                    status: "Returned"

                }

            })
        } else if (orderData.status === "processing") {
            const CancelOrder = await Order.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        status: "Cancelled",
                    },
                }
            );
           
        }
        else if (orderData.status === "Shipped") {
            const CancelOrder = await Order.findOneAndUpdate(
                { _id: id },
                {
                    $set: {
                        status: "Cancelled",
                    },
                }
            );
           
        }
        res.redirect('/order');
    } catch (error) {
        console.log(error);
    }
}

const viewShopProducts = async(req,res) => {
    try {

        const productData = await product.find({category:req.query.categoryid, soft_delete: false})
      
       
        res.render('shop',{products:productData ,logged:1})
    } catch (error) {
        console.log(error);
    }
}

const loadviewproduct = async (req, res) => {
    try {
        const orderData = await Order.find({ _id: ObjectId(req.query.id) });
        res.render('viewproduct', { adminlog: 1, order: orderData });

    } catch (error) {
        console.log(error.message);
    }
}
// admin order
const changestatus = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await Order.findOne({ _id: id })
        if (orderData.status === "processing") {
            const shipOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Shipped"
                }
            })
        } else if (orderData.status === "Shipped") {
            const deliverOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Out for Delivery"
                }
            })
        } else if (orderData.status === "Out for Delivery") {
            const deliverOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Delivered"
                }
            })
        }
        res.redirect('/admin/orders');
    } catch (error) {
        console.log(error.message)
    }
}

const successorder = async(req,res,next)=>{
    try {
        if(req.session.page){
           delete req.session.page 
            const orderData = await Order.find({}).sort({_id:-1}).limit(1)
        console.log(orderData)
        res.render('successorder',{logged:1,order:orderData})
        }else{
            res.redirect('/')
        }
        
    } catch (error) {
        
    }
}


module.exports ={
    loadOrder,
    loadsingleorder,
    cancelOrder,
    viewShopProducts,
    loadviewproduct,changestatus,
    successorder
}