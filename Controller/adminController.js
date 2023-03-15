const admin = require('../Models/adminModel');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const user = require('../Models/userModel');
const Order = require('../Models/orderModel')
const product = require('../Models/productModel');
const Coupon = require('../Models/couponModel')
const moment = require('moment')

let filter = false;

const loadLogin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            res.redirect('/admin/admin-home')
        } else {
            res.render("adminlog", {
                adminlog: false
            })
        }
    } catch (error) {
        next(error);
    }
}
const loadHome = async (req, res, next) => {
    try {
        const email = req.body.email;
        const checkAdmin = await admin.findOne({
            email: email
        });
        const orderdata = await Order.find({}).sort({
            _id: -1
        }).lean()
        res.render('adminhome', {
            adminlog: true,
            orderdata: orderdata,
            checkAdmin
        })
    } catch (error) {
        next(error);
    }
}
const AdminverifyLogin = async (req, res, next) => {
    try {
        // const orderdata = await Order.find({}).sort({
        //     _id: -1
        // }).lean()
        const email = req.body.email;
        const password = req.body.password;
        const checkAdmin = await admin.findOne({
            email: email
        });
        if (checkAdmin) {
            const passwordMatch = await bcrypt.compare(password, checkAdmin.password);
            if (passwordMatch) {
                req.session.admin_id = checkAdmin._id;
                res.redirect('/admin/')
            } else {
                res.render('adminlog', {
                    adminlog: false,
                    error: "Email and password is incorrect "
                });
            }
        } else {
            res.render('adminlog', {
                adminlog: false,
                error: "Email and password is incorrect "
            });
        }
    } catch (error) {
       next(error)
    }
}
const loadsignup = async (req, res, next) => {
    try {
        res.render('signup', {
            adminlog: false
        })
    } catch (error) {
        next(error);
    }
}
const signupAdmin = async (req, res, next) => {
    const checkUser = await admin.find({
        email: req.body.email
    })
    try {
        const secPassword = await config.securepassword(req.body.password)
        if (checkUser == '') {
            const Admin = new admin({
                name: req.body.name,
                email: req.body.email,
                password: secPassword,
            })
            const adminData = Admin.save()
            if (adminData) {
                res.render('adminlog', {
                    adminlog: false,
                    message: "your registration is  completed."
                })
            } else {
                res.render('signup', {
                    adminlog: 1,
                    error: "your registration is not completed"
                })
            }
        } else {
            res.render('signup', {
                adminlog: false,
                message: "Email already taken"
            });
        }
    } catch (error) {
        next(error);
    }
}
const loaduser = async (req, res, next) => {
    try {
        const userData = await user.find({})
        res.render('users', {
            adminlog: 1,
            users: userData
        })
    } catch (error) {
        next(error);
    }
}
const loadLogout = async (req, res, next) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        next(error);
    }
}
const blockUser = async (req, res, next) => {
    try {
        const id = req.query.id
        const userData = await user.findOneAndUpdate({
            _id: id
        }, {
            $set: {
                blocked: true
            }
        });
        res.redirect('/admin/users');
    } catch (error) {
        next(error);
    }
}
const unBlockUser = async (req, res,next) => {
    try {
        const id = req.query.id
        const userData = await user.findOneAndUpdate({
            _id: id
        }, {
            $set: {
                blocked: false
            }
        });
        res.redirect('/admin/users');
    } catch (error) {
        next(error)
    }
}
const loadOrder = async (req, res,next) => {
    try {
        const orderData = await Order.find({}).sort({
            _id: -1
        })
        const date = moment(orderData.date).format("MMMM Do YYYY, h:mm a");
        res.render("orders", {
            orders: orderData, orderdate:date,
            adminlog: 1
        });
    } catch (error) {
        next(error);
    }
};
const dashboardData = async (req, res, next) => {
    try {
        const totalDeliveredsum = await Order.aggregate([{
            $match: {
                status: 'Delivered'
            },
        }, {
            $group: {
                _id: {
                    $month: '$date'

                },
                sum: {
                    $sum: '$subtotal'
                }
            }
        }])

        const Piechart = await Order.aggregate([{
            $match: {
                $or: [{
                    status: 'Returned'
                }, {
                    status: 'Delivered'
                }, {
                    status: 'Cancelled',
                }]
            },
        }, {
            $group: {
                _id: {
                    status: '$status',
                },
                sum: {
                    $sum: 1
                }
            }
        }])
        const Cancelorder = await Order.aggregate([{
            $match: {
                $or: [{
                    status: 'Returned'
                }, {
                    status: 'Delivered'
                }, {
                    status: 'Cancelled',
                }]
            },
        }, {
            $group: {
                _id: {
                    status: '$status',
                    date: {
                        $month: '$date'
                    },
                },
                sum: {
                    $sum: 1
                }
            }
        }])
        let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        let Delivered = []
        let delivered = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let Returned = []
        let returned = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let Cancelled = []
        let cancelled = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        Cancelorder.forEach((item) => {
            if (item._id.status == 'Delivered')
                Delivered.push(item)

            if (item._id.status == 'Returned')
                Returned.push(item)

            if (item._id.status == 'Cancelled')
                Cancelled.push(item)
        })
        for (let index = 0; index < 12; index++) {
            months.forEach((item) => {
                if (Delivered[index]) {
                    if (item == Delivered[index]._id.date)
                        delivered[item - 1] = Delivered[index].sum
                }

                if (Returned[index]) {
                    if (item == Returned[index]._id.date)
                        returned[item - 1] = Returned[index].sum
                }

                if (Cancelled[index]) {
                    if (item == Cancelled[index]._id.date)
                        cancelled[item - 1] = Cancelled[index].sum
                }
            })
        }
        res.json({
            pie: Piechart,
            revenue: totalDeliveredsum,
            chart: {
                delivered,
                cancelled,
                returned
            }
        })
    } catch (error) {
       
        next(error)
    }
}
const loadcoupons = async (req, res,next) => {
    try {
        const couponData = await Coupon.find()

        res.render('coupon', {
            adminlog: true,
            coupon: couponData
        })
    } catch (error) {
        next(error);
    }
}
//add new coupon
const addCoupon = async (req, res,next) => {
    try {
        res.render('add-coupon', {
            adminlog: true
        })
    } catch (error) {
        next(error);
    }
}
const insertcoupon = async (req, res,next) => {
    try {
        const coupon = new Coupon({
            code: req.body.code,
            date: req.body.date,
            percentage: req.body.percent
        })
        const couponData = await coupon.save()

        if (couponData) {
            res.redirect('/admin/coupon')
        } else {
            res.redirect('/admin/add-coupon')
        }

    } catch (error) {
        next(error);
    }
}
const deleteimage = async (req, res ,next) => {
    try {
        const {
            img,
            id
        } = req.params
        const result = await product.updateOne({
            _id: id
        }, {
            $pull: {
                image:img
            }
        });
        if (result) {
            res.json("success")
        } else {
            res.json('error')
        }

    } catch (error) {
        next(error);
    }
}
const salesReport = async (req, res,next) => {
    try {
        const orderdata = await Order.aggregate([{
                $match: {
                    status: "Delivered"
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: {
                        $sum: "$subtotal"
                    }

                },

            },
            {
                $sort: {
                    _id: 1
                }
            }
        ]);

        if (!filter) {
         const orderdataFilter = await Order.find({
                status: "Delivered"
            })
        }
        const products = orderdata.product;
        const date = moment(orderdata.date).format("MMMM Do YYYY, h:mm a");
        const totalSales = orderdata.length > 0 ? orderdata[0].totalSales : 0;
        res.render('sales', {
            adminlog: 1,
            orderdata: orderdataFilter,
            totalSales: totalSales,
            orderdate:date,
            product:products
        });

    } catch (error) {
        next(error);
    }
}

// const filteringOrder = async (req, res) => {
//     try {
//         const reqDate = req.body.fromDate
//         const toDate = req.body.toDate


//         orderdataFilter = await Order.find(
//             // {$or:[{
//             {
//                 $and: [
//                     {
//                         delivery_date: {
//                             $gt: reqDate,
//                         }
//                     },
//                     {
//                         delivery_date: {
//                             $lt: toDate,
//                         }
//                     }]
//             });

//         next(reqDate, toDate);
//         next(orderdataFilter);

//         filter = true;
//         res.redirect('/admin/sales-report');
//     } catch (error) {
//         next(error);
//     }
// }





module.exports = {
    loadLogin,
    loadHome,
    AdminverifyLogin,
    loadsignup,
    signupAdmin,
    loaduser,
    loadLogout,
    blockUser,
    unBlockUser,
    loadOrder,
    dashboardData,
    loadcoupons,
    addCoupon,
    insertcoupon,
    deleteimage,
    salesReport,
    // filteringOrder

}