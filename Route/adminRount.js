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
    secret: (config.sessionSecret),
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

admin_route.get('/category', categoryController.loadCategory)
admin_route.get('/add-category', categoryController.loadAddcategory)
admin_route.post('/add-category',categoryController.insertCategory)
admin_route.get('/edit-category',categoryController.editCategory);
admin_route.post('/edit-category', categoryController.updateCategory);
admin_route.get('/delete-category', categoryController.deleteCategory);

admin_route.get('/product', productController.loadProduct)
admin_route.get('/add-product', productController.productAdd)
admin_route.post('/add-product', upload.array('image',4), productController.productinsert)
admin_route.post('/edit-product', upload.single('image'), productController.updateProduct)
admin_route.get('/edit-product', productController.loadEditproduct)
admin_route.get('/delete-product', productController.deleteProduct)

admin_route.get('/users', adminController.loaduser);
admin_route.get('/admin-logout', auth.isLoginAdmin, adminController.loadLogout)
admin_route.get('/block-user', adminController.blockUser);
admin_route.get('/unblock-user', adminController.unBlockUser);
admin_route.get('/orders',adminController.loadOrder)

admin_route.get('/banner',bannerController.loadBanner)
admin_route.get('/add-banner',bannerController.loadaddBanner)
admin_route.post('/add-banner',banner.single('image'),bannerController.insertBanner);
admin_route.get('/edit-banner',bannerController.editBanner)
admin_route.get('/view-product',orderController.loadviewproduct)
admin_route.get('/change-status',orderController.changestatus)

module.exports = admin_route;