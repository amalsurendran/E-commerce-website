const user = require('../Models/userModel');
const bcrypt = require('bcrypt');
const swal = require('sweetalert')
const config = require('../config/config');
const banner = require('../Models/bannerModel')
const Category = require('../Models/categoryModel');

const {
    constants
} = require('crypto');
const product = require('../Models/productModel');
const {
    render
} = require('../Route/adminRount');
const client = require("twilio")(config.accountSid, config.authToken);

let logged = false;


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
const OTP = generateOTP();

const otpsending = async function sendotp(mobile) {


    try {
        const check = await generateOTP();

        client.messages.create({
                body: OTP,
                to: mobile,
                from: '+16018846310'
            }).then(message => console.log(message))
            // here you can implement your fallback code
            .catch(error => console.log(error))

    } catch (error) {
        console.log(error);


    }

}
const loadhome = async (req, res, next) => {
    
    try {
        const bannerData = await banner.find({});
        const categoryData = await Category.find({})

        const productData = await product.find({
            soft_delete: false
        });

        if (req.session.user_id) {
            res.render('home', {
                product: productData,
                category: categoryData,
                logged: 1,
                banner: bannerData
            })
        } else {
            res.render('home', {
                login: 1,
                product: productData,
                banner: bannerData,
                category: categoryData,
            })
        }

    } catch (error) {
        next(error)

    }
}
const loginLoad = async (req, res, next) => {
    try {
        res.render("login", {
            login: false
        })
    } catch (error) {
        console.log(error);
    }
}
const loadsignup = async (req, res, next) => {
    try {
        res.render('signup', {
            login: false
        })
    } catch (error) {
        console.log(error);
    }
}
const insertUser = async (req, res, next) => {
    const checkUser = await user.findOne({
        email: req.body.email
    })
    console.log(checkUser);
    const mob = await user.findOne({
        mobile: req.body.mobile
    })
    console.log(mob);
    try {
        const secPassword = await config.securepassword(req.body.password)

        if (!checkUser) {
            console.log('no users found');
            if (!mob) {
                console.log('no mobile ');
                const User = new user({
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.mobile,
                    password: secPassword,
                    is_verified: 0,
                    token: OTP
                })
                if (req.body.password === req.body.conpassword) {
                    console.log("password check");
                    const userData = await User.save();
                    if (userData) {

                        otpsending(req.body.mobile);
                        res.render('verify', {
                            login: false,
                            message: "your registration is  completed. please enter otp and verify your account",
                            email: userData.email,
                            mobile: req.body.mobile

                        })
                    } else {
                        res.render('signup', {
                            login: false,
                            error: "your registration is not completed"
                        })
                    }
                } else {
                    res.render('signup', {
                        login: false,
                        error: "password do not matching"
                    })
                }
            }
        } else {
            res.render('signup', {
                login: false,
                error: " Email or mobile already taken"
            })
        }

    } catch (error) {
        next(error)
    }
}
const loadverify = async (req, res, next) => {
    
    try {
    
        res.render('verify', {
            logged: true
        })
        
    } catch (error) {
        console.log(error);
    }
}
const otpverify = async (req, res, next) => {
   
    try {
       
        const checkUser = await user.findOne({
            email: req.body.email
        })
        const enterotp = await req.body.otp;

        if (enterotp == checkUser.token) {
            const updatedinfo = await user.updateOne({
                email: req.body.email
            }, {
                $set: {
                    is_verified: 1
                }
            });
            res.render('login', {
                login: false
            });

        } else {
            res.render('verify', {
                login: false,
                error: "invalid otp please"
            })
        }
    } catch (error) {

        console.log(error);
    }
}
const verifyLogin = async (req, res, next) => {

    try {
        
        const productData = await product.find({})
        const email = req.body.email;
        const password = req.body.password;
        const userData = await user.findOne({
            email: email
        });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (!userData.is_verified) {

                    res.render('login', {
                        login: false,
                        error: "please verify your mail.",
                    })

                } else {
                    if (userData.blocked) {
                        res.render('login', {
                            login: false,
                            error: "Temporarily blocked by admin.",
                        })
                    } else {
                        logged = true;
                        req.session.user_id = userData._id
                        res.redirect('/')

                    }
                }
            } else {
                res.render('login', {
                    login: false,
                    error: "email and  password is incorrect "
                })
            }

        } else {
            res.render('login', {
                login: false,
                error: "email and  password is incorrect "
            })
        }

    } catch (error) {
        console.log(error)
    }

}
const otpredsend = async (req, res, next) => {
    try {
        res.render('resend', {
            login: false
        })
    } catch (error) {

        console.log(error);
    }
}
const loadresend = async (req, res, next) => {

    try {
        res.render('resend', {
            login: false
        })
    } catch (error) {

    }

}
const
    resendotp = async (req, res, next) => {
        try {
            const {
                email,
                mobile
            } = req.params
           
           
            const OTP = generateOTP()
            client.messages.create({
                    body: OTP,
                    to: mobile ,
                    from: '+16018846310'
                }).then(message => console.log(message))
                .catch(error => console.log(error))
            const updatedinfo = await user.updateOne({
                email: email 
            }, {
                $set: {

                    token: OTP
                }
            });
            console.log(updatedinfo);
            updatedinfo ? res.render('verify', {
                login: 0,
                message: "otp resend please check your phone",
                email: email,
                mobile: mobile,
                
            }) : res.render('verify', {
                login: 0,
                message: "Something went wrong please try again",
                email: email,
                mobile: mobile,
                
            })
        } catch (error) {
            console.log(error);
            res.render('verify', {
                login: 0,
                message: "Can't sent OTP",
                email: email,
                mobile: mobile
            })
        }
    }
const loadSend = async (req, res, next) => {

    try {
        const userdata = await user.find()
        res.render('resend', {
            login: false
        })
    } catch (error) {
        console.log(error);
    }

}
const productview = async (req, res, next) => {
    try {

        if (req.session.user_id) {
            const id = req.query.id
            const productData = await product.findById({
                _id: id
            })
            res.render('productview', {
                product: productData,
                logged: 1

            });
        } else {
            const id = req.query.id
            const productData = await product.findById({
                _id: id
            })
            res.render('productview', {
                product: productData,
                login: 1

            });
        }

    } catch (error) {
        console.log(error)
    }

}
const userLogout = async (req, res) => {
    try {
        logged = false
        req.session.destroy()
        res.redirect('/');
    } catch (error) {
        console.log(error);
    }
}

const LoadUserprofile = async (req, res, next) => {

    try {

        const userData = await user.findOne({
            _id: req.session.user_id
        }).lean();
        res.render('userprofile', {
            logged: 1,
            user: userData,
            address: userData.Address
        })
        console.log(userData[0].Address);
    } catch (error) {
        console.log(error);
    }

}


const loadAddress = async (req, res, next) => {
    try {
        const userData = await
        res.render('address', {
            logged: 1
        })
    } catch (error) {
        console.log(error);
    }
}




const loadPasswordchange = async (req, res, next) => {
    try {
        res.render('passwordchange', {
            logged: 1
        })
    } catch (error) {

    }

}

const changePassword = async (req, res, next) => {
    try {

        const userData = await user.findOne({
            _id: req.session.user_id
        })
        const password = await req.body.password

        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (passwordMatch) {
            const secPassword = await config.securepassword(req.body.npassword)
            const updatedinfo = await user.updateOne({
                _id: req.session.user_id
            }, {
                $set: {
                    password: secPassword
                }
            });

            res.redirect('/userprofile')

        }
    } catch (error) {
        console.log(error);
    }

}


const updateProfile = async (req, res) => {
    try {

        const userData = await user.updateOne({
            _id: req.session.user_id
        }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile
            }
        })
        res.redirect('/user-profile');
    } catch (error) {
        console.log(error);
    }
}

const addAddress = async (req, res) => {
    try {
        const address = await user.findByIdAndUpdate({
            _id: req.session.user_id
        }, {
            $addToSet: {
                Address: req.body
            }
        });
        res.redirect('/userprofile');
    } catch (error) {
        console.log(error);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await user.findByIdAndUpdate({
            _id: req.session.user_id
        }, {
            $pull: {
                Address: {
                    _id: id
                }
            }
        });
        res.redirect('/user-profile');
    } catch (error) {
        console.log(error);
    }
}

const loadforgetpassword = async (req, res) => {
    try {

        res.render('forgetpassword')
    } catch (error) {
        console.log(error);
    }
}

const load404 = async (req, res) => {
    try {
        res.render('404')
    } catch (error) {
        console.log(error);
    }
}

const loadReset =async(req,res)=>{
    try {
       res.render('resetpassword') 
    } catch (error) {
        
    }
}
 const forget = async (req, res, next) => {
    try {
       

        const mob = req.body.mobile
        console.log(mob);
        const userdata = await user.findOne({
            mobile: mob
        })
        console.log(userdata,"userotp");
        const OTP = generateOTP()
        client.messages.create({
                body: OTP,
                to: req.body.mobile,
                from: '+16018846310'
            }).then(message => console.log(message))
            .catch(error => console.log(error))
        const updatedinfo = await user.updateOne({
            email:userdata.email
        }, {
            $set: {

                token: OTP
            }
        });
        console.log(OTP,"amal");
        console.log(updatedinfo);
        updatedinfo ? res.render('forgetVerify', {
            login: false,
            message: "otp resend please check your phone",
            
            mobile: mob,
            email: userdata.email
        }) : res.render('forgetVerify', {
            login: false,
            message: "Something went wrong please try again",
           
            mobile: mob,
            email: userdata.email
        })
    } catch (error) {
        console.log(error);
        res.render('forgetVerify', {
            login: false,
            message: "Can't sent OTP",
            email: email,
            mobile: mobile
        })
    }
}

const loadFogetverify = async(req,res)=>{
    try {
        res.render('forgetVerify')
    } catch (error) {
        
    }
}

const forgetotp = async (req, res, next) => {
   
    try {
       
        const checkUser = await user.findOne({
            email: req.body.email
        })
        
        const enterotp = await req.body.otp;
        console.log(req.body.otp);
        console.log(checkUser);

        if (enterotp == checkUser.token) {
            const updatedinfo = await user.updateOne({
                email: req.body.email
            }, {
                $set: {
                    is_verified: 1
                }
            });
            res.render('resetpassword', { checkUser,
                login: false
            });

        } else {
            res.render('forgetVerify', {
                login: false,
                error: "invalid otp please"
            })
        }
    } catch (error) {

        console.log(error);
    }
}

const  resetPassword = async (req, res) => {

    try {
        const password = req.body.password;
        const conpassword = req.body.conpassword;
        const secure_Password = await config.securepassword(password);
            console.log(req.body.email,'email');
        if (password === conpassword) {
            const updatedData = await user.findOneAndUpdate({ email:req.body.email }, { $set:{ password:secure_Password} });
            res.redirect('/login');
        } else {
            res.render('resetpassword', { loggedout: 1, message: "password doesn't match" })
        }
    } catch (error) {
        console.log(error);
    }

}

const searchedData = async (req, res) => {
    try {
        const data = await product.find({ name: { $regex: req.body.text } });
        const length = data.length
        if (req.session.user_id) {
            res.render('searched', { products: data, logged: 1, length });
        } else {
            res.render('searched', { products: data, login: 1, length });
        }
    } catch (error) {
        console.log(error);
    }


}




module.exports = {
    loginLoad,
    loadsignup,
    loadverify,
    loadhome,
    insertUser,
    otpverify,
    verifyLogin,
    otpredsend,
    loadresend,
    resendotp,
    loadSend,
    productview,
    userLogout,
    LoadUserprofile,
    loadAddress,
    loadPasswordchange,
    changePassword,
    updateProfile,
    addAddress,
    deleteAddress,
    loadforgetpassword,
    load404,
    loadReset,
    forget,
    loadFogetverify,
    forgetotp,
    resetPassword,
    searchedData







}