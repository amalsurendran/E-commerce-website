const Category = require('../Models/categoryModel');
const { ObjectId } = require('mongodb');
const product = require('../Models/productModel');

const loadCategory = async (req, res, next) => {
    try {
        const categoryData = await Category.find({
            soft_delete: false
        }).lean();
        res.render('category', {
            category: categoryData,
            adminlog: 1
        })
    } catch (error) {
        console.log(error);
    }
}
const loadAddcategory = async (req, res, next) => {
    const categoryData = await Category.find({})
    try {      
        res.render('add-category', { category:categoryData,
            adminlog: 1
        })
    } catch (error) {
        console.log(error);
    }
}
const insertCategory = async (req, res, next) => {
    try {      
        const categoryata = await Category.find({name:req.body.name})
        if (categoryata) {       
            res.render('add-category', {
                // category:categoryata,
                adminlog: 1,
                error: "Category already exist"
            })
        } else {
            const category = new Category({
                name: req.body.name,        
            });
            const categoryData = await category.save();
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error);
    }
}
const editCategory = async (req, res, next) => {
    try {
        const id = req.query.id
        const categoryData = await Category.findById({
            _id: id
        })
        res.render('edit-category', {
            category: categoryData,
            adminlog: true
        });
    } catch (error) {
        console.log(error);
    }
}
const updateCategory = async (req, res, next) => {
    try {
        const categoryData = await Category.findOne({
            name:req.body.name
        })
        if (categoryData) {
            res.render('edit-category', {
                category:categoryData,
                adminlog: 1,
                error: "Category alreasy exist"
            })
        } else {
            const name = req.body.name
            const categoryData = await Category.findByIdAndUpdate({
                _id: req.body.id
            }, {
                $set: {
                    name: name
                }
            })
            res.redirect('/admin/category');
        }
    } catch (error) {
        console.log(error);
    }
}
const deleteCategory = async (req, res, next) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.updateOne({
            _id: id
        }, {
            soft_delete: true
        });
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error)
    }
}
const loadshopcategory = async(req,res)=>{
    try {
        const productData = await product.find({
            soft_delete: false
        });
        const categoryData = await Category.find({})
        res.render('shopcategory',{category:categoryData,logged:1,product:productData})
    } catch (error) {
        console.log(error);
    }
}

module.exports={
    deleteCategory,
    updateCategory,
    loadAddcategory,
    loadCategory,
    insertCategory,
       editCategory,
       loadshopcategory
}