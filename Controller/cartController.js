const user = require('../Models/userModel');
const {
    ObjectId
} = require('mongodb');
const {
    render
} = require('../Route/adminRount');
const Order = require('../Models/orderModel')
const product = require('../Models/productModel');
const razorpay = require('razorpay')
const moment = require('moment')
const Coupon = require('../Models/couponModel')
const loadCart = async (req, res,next) => {

    try {
        const cartData = await user.aggregate([{
                $match: {
                    _id: ObjectId(req.session.user_id)
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: {
                        cartItems: "$cart"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$cartItems.productId"],
                            }
                        }
                    }],
                    as: 'productcartData'
                }
            }
        ]);
        const productDat = await product.aggregate([{
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "products",
            },
        }, ]);
        const cartProducts = cartData[0].productcartData
        let subtotal = 0;
        cartProducts.forEach((cartProduct) => {
            subtotal = subtotal + Number(cartProduct.price);
        });
        const length = cartProducts.length
        res.render('cart', {
            logged: 1,
            cartProducts,
            subtotal,
            length
        });
    } catch (error) {
        next(error)
    }
}
const addToCart = async (req, res,next) => {
    try {
        const cartData = await user.updateOne({
            _id: req.session.user_id
        }, {
            $addToSet: {
                cart: {
                    productId: req.query.id
                }
            }
        });
        res.redirect('/home');
    } catch (error) {
        next(error);
    }
}
const removeCartProduct = async (req, res,next) => {
    try {
        const result = await user.findByIdAndUpdate({
            _id: req.session.user_id
        }, {
            $pull: {
                cart: {
                    productId: req.params.id
                }
            }
        });
        res.json("success")
    } catch (error) {
        next(error);
    }
}
const loadcart = async (req, res) => {
    try {
        res.render('checkoutAddress', {
            checknav: 1
        });
    } catch (error) {
        next(error);
    }
}
let total
const checkOut = async (req, res,next) => {
    try {
        const address = await user.find({
            _id: req.session.user_id
        }).lean();

        const cartData = await user.aggregate([{
                $match: {
                    _id: ObjectId(req.session.user_id)
                }
            },
            {
                $lookup: {
                    from: "products",
                    let: {
                        cartItems: "$cart"
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $in: ["$_id", "$$cartItems.productId"],
                            },
                        },
                    }, ],
                    as: "Cartproducts",
                },
            },
        ]);
        let subtotal = 0;
        const cartProducts = cartData[0].Cartproducts;
        cartProducts.map((cartProduct, i) => {
            cartProduct.quantity = req.body.quantity[i];
            subtotal = subtotal + cartProduct.price * req.body.quantity[i];
        });
        res.render("checkout", {
            productDetails: cartData[0].Cartproducts,
            subtotal: subtotal,
            address: address[0].Address,
            logged: 1,
            total: subtotal,
            offer: 0
        });
    } catch (error) {
        next(error);
    }

}
const checkoutAddress = async (req, res,next) => {
    try {
        const address = await user.findByIdAndUpdate({
            _id: req.session.user_id
        }, {
            $addToSet: {
                Address: req.body
            }
        });
        res.redirect('/cart');
    } catch (error) {
        next(error);
    }
}
let couponCode
let couponamount
const placeOrder = async (req, res,next) => {
    try {
        const {
            productid,
            productname,
            payment,
            price,
            quantity,
            addressId,
            subtotal
        } = req.body;
        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;
        total = subtotal;
        const date = new Date()
        const lensproduct = productid.map((item, i) => ({
            id: productid[i],
            name: productname[i],
            price: price[i],
            quantity: quantity[i]
        }));
        if (req.body.coupon) {
            couponCode = req.body.coupon;
            const applied = await Coupon.findOne({
                code: req.body.coupon
            })
            couponamount = applied.percentage
            if (couponamount) {
                const amount = (subtotal * couponamount) / 100
                total = subtotal - amount
            } else {
                total = subtotal
            }
        }
        let data = {
            userId: ObjectId(req.session.user_id),
            orderId: orderId,
            date: date,
            addressId: addressId,
            product: lensproduct,
            status: "processing",
            payment_method: String(payment),
            subtotal: total
        };
        const orderPlacement = await Order.insertMany(data);
        const clearCart = await user.updateOne({
            _id: req.session.user_id
        }, {
            $set: {
                cart: []
            }
        })
        quantity.map(async (item, i) => {
            const reduceStock = await product.updateOne({
                _id: ObjectId(productid[i])
            }, {
                $inc: {
                    quantity: -Number(item)
                }
            })
        })
        if (orderPlacement && clearCart) {
            req.session.page = 'fghnjm'
            res.json({
                res: "success",
                data: data
            })
        } else {
            const handlePlacementissue = await Order.deleteMany({
                orderId: orderId,
            });
            res.json("try again")
        }
    } catch (error) {
        res.json("try again")

    }
};



module.exports = {
    loadCart,
    addToCart,
    removeCartProduct,
    checkOut,
    loadcart,
    checkoutAddress,
    placeOrder,

}