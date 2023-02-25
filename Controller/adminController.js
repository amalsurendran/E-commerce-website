const admin = require('../Models/adminModel');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const user = require('../models/userModel');
const Order = require('../Models/orderModel')



const loadLogin = async (req, res, next) => {
    try {

        if (req.session.admin_id) {
            res.redirect('/admin/adminhome')
        } else {
            res.render("adminlog", {
                adminlog: false
            })
        }

    } catch (error) {
        console.log(error);
    }
}
const loadHome = async (req, res, next) => {
    try {
        const orderdata = await Order.find({}).sort({_id:-1}).lean()
        res.render('adminhome', {
            adminlog: true,order:orderdata
        })

    } catch (error) {
        console.log(error);
    }
}
const AdminverifyLogin = async (req, res, next) => {
    try {
        const orderdata = await Order.find({}).sort({_id:-1}).lean()
        const email = req.body.email;
        const password = req.body.password;
        const checkAdmin = await admin.findOne({
            email: email
        });


        if (checkAdmin) {
            const passwordMatch = await bcrypt.compare(password, checkAdmin.password);
            if (passwordMatch) {
                req.session.admin_id = checkAdmin._id;
                res.render('adminhome', {
                    adminlog: true,orderdata,checkAdmin
                })
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

        console.log(error)
    }
}
const loadsignup = async (req, res, next) => {
    try {
        res.render('signup', {
            adminlog: false
        })
    } catch (error) {
        console.log(error);
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
        console.log(error);
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
        console.log(error);
    }

}
const loadLogout = async (req, res, next) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
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
        console.log(error);
    }

}
const unBlockUser = async (req, res) => {

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
        console.log(error)
    }
}

const loadOrder= async (req, res) => {
    try {
      
        const orderData = await Order.find({}).sort({_id:-1})
  
      res.render("orders",{orders:orderData,adminlog:1});
    } catch (error) {
      console.log(error);
    }
  };




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
    loadOrder
}