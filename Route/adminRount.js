const express = require('express');
const admin_route = express();

const auth = require('../middeleware/Auth')
const session = require('express-session');
admin_route.set('views', './views/admin')
const config = require('../config/config');
const {upload} = require('../middeleware/multer')
const {banner} =require('../middeleware/multer')

admin_route.use(session({
    saveUninitialized: false,
    secret:"mysitesessionsecret",
    //secret: (config.sessionSecret),
    resave: false,

}));

admin_route.use(auth.cache)


const categoryController = require('../Controller/categoryController')
const productController = require('../Controller/productController')
const adminController = require('../Controller/adminController');
const bannerController =require('../Controller/bannerController')
const orderController = require('../Controller/orderController')

admin_route.get('/', auth.isLogoutAdmin, adminController.loadLogin)
admin_route.get('/admin', auth.isLogoutAdmin, adminController.loadLogin)
admin_route.get('/admin-home',auth.isLoginAdmin, adminController.loadHome)
admin_route.post('/', adminController.AdminverifyLogin)
admin_route.get('/signup', auth.isLogoutAdmin, adminController.loadsignup)
admin_route.post('/signup', adminController.signupAdmin)

admin_route.get('/category',auth.isLoginAdmin, categoryController.loadCategory)
admin_route.get('/add-category',auth.isLoginAdmin, categoryController.loadAddcategory)
admin_route.post('/add-category',categoryController.insertCategory)
admin_route.get('/edit-category',auth.isLoginAdmin,categoryController.editCategory);
admin_route.post('/edit-category',auth.isLoginAdmin, categoryController.updateCategory);
admin_route.get('/delete-category',auth.isLoginAdmin, categoryController.deleteCategory);

admin_route.get('/product',auth.isLoginAdmin, productController.loadProduct)
admin_route.get('/add-product',auth.isLoginAdmin, productController.productAdd)
admin_route.post('/add-product',auth.isLoginAdmin, upload.array('image',4), productController.productinsert)
admin_route.post('/edit-product',auth.isLoginAdmin, upload.array('image',4), productController.updateProduct)
admin_route.get('/edit-product',auth.isLoginAdmin, productController.loadEditproduct)
admin_route.get('/delete-product', auth.isLoginAdmin,productController.deleteProduct)

admin_route.get('/users',auth.isLoginAdmin, adminController.loaduser);
admin_route.get('/admin-logout', auth.isLoginAdmin, adminController.loadLogout)
admin_route.get('/block-user',auth.isLoginAdmin, adminController.blockUser);
admin_route.get('/unblock-user',auth.isLoginAdmin, adminController.unBlockUser);
admin_route.get('/orders',auth.isLoginAdmin,adminController.loadOrder)

admin_route.get('/banner',auth.isLoginAdmin,bannerController.loadBanner)
admin_route.get('/add-banner',auth.isLoginAdmin,bannerController.loadaddBanner)
admin_route.post('/add-banner',auth.isLoginAdmin,banner.array('image',3),bannerController.insertBanner);
admin_route.get('/edit-banner',auth.isLoginAdmin,bannerController.editBanner)
admin_route.get('/view-product',auth.isLoginAdmin,orderController.loadviewproduct)
admin_route.get('/change-status',auth.isLoginAdmin,orderController.changestatus)
admin_route.get('/dash-bord',auth.isLoginAdmin,adminController.dashboardData)
admin_route.get('/coupon',auth.isLoginAdmin,adminController.loadcoupons)
admin_route.get('/add-coupon',auth.isLoginAdmin,adminController.addCoupon)
admin_route.post('/add-coupon',auth.isLoginAdmin,adminController.insertcoupon)
admin_route.delete('/removeimage/:img/:id',auth.isLoginAdmin,adminController.deleteimage)
admin_route.get('/sales-report',auth.isLoginAdmin,adminController.salesReport)
// admin_route.post('/filter',adminController.filteringOrder)

module.exports = admin_route;