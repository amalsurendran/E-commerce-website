const user = require('../Models/userModel');
const Order = require('../Models/orderModel')
const product = require('../Models/productModel');
const Coupon = require('../Models/couponModel')
const {
    ObjectId
} = require('mongodb');
const moment = require('moment')


const loadOrder = async (req, res,next) => {
    try {
        const orderData = await Order.find({
            userId: req.session.user_id
        }).sort({
            _id: -1
        })
        res.render('myOrders', {
            order: orderData,
            loggedd: 1
        })
    } catch (error) {
        next(error)
    }
}
const loadsingleorder = async (req, res,next) => {
    try {
        const orderData = await Order.find({
            orderId: req.query.id
        }).lean();
        res.render('singleorder', {
            order: orderData,
            logged: 1
        }) //pwer:pID
    } catch (error) {
        next(error);
    }
}
const cancelOrder = async (req, res,next) => {
    try {
        const id = req.query.id;
        const orderData = await Order.findById({
            _id: id
        }).lean();
        const pID = orderData.product;
        pID.forEach(async (elem, i) => {
            const reduceStock = await product.updateOne({
                _id: elem.id
            }, {
                $inc: {
                    quantity: +elem.quantity
                }
            })
        })
        if (orderData.status === "Delivered") {
            const returnOrder = await Order.findOneAndUpdate({
                _id: id
            }, {

                $set: {
                    status: "Returned"

                }

            })
        } else if (orderData.status === "processing") {
            const CancelOrder = await Order.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    status: "Cancelled",
                },
            });

        } else if (orderData.status === "Shipped") {
            const CancelOrder = await Order.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    status: "Cancelled",
                },
            });

        }
        res.redirect('/order');
    } catch (error) {
        next(error);
    }
}
const viewShopProducts = async (req, res,next) => {
    try {
        const productData = await product.find({
            category: req.query.categoryid,
            soft_delete: false
        })
        res.render('shop', {
            products: productData,
            logged: 1
        })
    } catch (error) {
        next(error);
    }
}
const loadviewproduct = async (req, res,next) => {
    try {
        const orderData = await Order.find({
            _id: ObjectId(req.query.id)
        });
        res.render('viewproduct', {
            adminlog: 1,
            order: orderData
        });
    } catch (error) {
        next(error.message);
    }
}
// admin order
const changestatus = async (req, res,next) => {
    try {
        const id = req.query.id;
        const orderData = await Order.findOne({
            _id: id
        })
        if (orderData.status === "processing") {
            const shipOrder = await Order.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    status: "Shipped"
                }
            })
        } else if (orderData.status === "Shipped") {
            const deliverOrder = await Order.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    status: "Out for Delivery"
                }
            })
        } else if (orderData.status === "Out for Delivery") {
            const deliverOrder = await Order.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    status: "Delivered"
                }
            })
        }
        res.redirect('/admin/orders');
    } catch (error) {
        next(error.message)
    }
}
const successorder = async (req, res, next) => {
    try {
        if (req.session.page) {
            delete req.session.page
            const orderData = await Order.find({}).sort({
                _id: -1
            }).limit(1)
            res.render('successorder', {
                logged: 1,
                order: orderData
            })
        } else {
            res.redirect('/')
        }

    } catch (error) {
        next(error)
    }
}
let offerPrice
const coupon = async (req, res, next) => {
    try {
        const codeId = req.body.code
        const total = req.body.total
        const couponData = await Coupon.findOne({
            code: codeId
        }).lean();
        const userData = await Coupon.findOne({
            code: codeId,
            userId: req.session.user_id
        }).lean()
        if (couponData && couponData.date > moment().format("YYYY-MM-DD")) {
            offerPrice = couponData.percentage
            if (userData) {
                res.json("fail")
            } else {
                const amount = total * offerPrice / 100
                const gtotal = total - amount
                res.json({
                    offerPrice: offerPrice,
                    gtotal: gtotal,
                    total: total
                })
                const userupdate = await Coupon.updateOne({
                    code: codeId
                }, {
                    $push: {
                        userId: req.session.user_id
                    }
                })
            }
        } else {
            res.json('fail')
        }
    } catch (error) {
        next(error);
    }
}
const loadWishlist = async (req, res,next) => {
    try {
        const wishlistData = await user.aggregate([{
                $match: {
                    _id: ObjectId(req.session.user_id)
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: 'wishlist.productId',
                    foreignField: '_id',
                    as: 'Wishlist'
                }
            }
        ]);
        const wishlistProducts = wishlistData[0].Wishlist
        const length = wishlistProducts.length
        res.render('whishlist', {
            wishlistProducts,
            length,
            logged: 1
        });
    } catch (error) {
        next(error);
    }
}
const addToWishlist = async (req, res,next) => {
    try {
        const id = req.query.id;
        const wishlistData = await user.updateOne({
            _id: req.session.user_id
        }, {
            $addToSet: {
                wishlist: {
                    productId: id
                }
            }
        });
        res.redirect('/home');
    } catch (error) {
        next(error);
    }
}
const removeWishlistProduct = async (req, res,next) => {
    try {
        const result = await user.findByIdAndUpdate({
            _id: req.session.user_id
        }, {
            $pull: {
                wishlist: {
                    productId: req.params.id
                }
            }
        });
        res.json("success")
    } catch (error) {
        next(error)
    }
}
const wishlistToCart = async (req, res,next) => {
    try {
        const result = await user.updateOne({
            _id: req.session.user_id
        }, {
            $addToSet: {
                cart: {
                    productId: ObjectId(req.query.id)
                }
            }
        });
        if (result) {
            const deletee = await user.findByIdAndUpdate({
                _id: req.session.user_id
            }, {
                $pull: {
                    wishlist: {
                        productId: req.query.id
                    }
                }
            })
        }
        res.redirect('/wishlist')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    loadOrder,
    loadsingleorder,
    cancelOrder,
    viewShopProducts,
    loadviewproduct,
    changestatus,
    successorder,
    coupon,
    // loadSales,
    loadWishlist,
    addToWishlist,
    removeWishlistProduct,
    wishlistToCart
}