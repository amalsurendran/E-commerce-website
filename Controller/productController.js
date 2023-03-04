const product = require('../Models/productModel');
const Category = require('../Models/categoryModel');
const {
    ObjectId
} = require('mongodb');


const loadProduct = async (req, res, next) => {

    try {
        const productDat = await product.aggregate([{
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "products",
            },
        }, ]);


        const products = productDat.filter((val) => {
            if (val.soft_delete == false) {
                return true
            }

        })
        res.render('product', {
            adminlog: true,
            product: products
        });

    } catch (error) {
        next(error);
    }
}

const productAdd = async (req, res, next) => {

    try {
        const categoryData = await Category.find({});
        res.render('add-product', {
            adminlog: true,
            category: categoryData
        });
    } catch (error) {
        console.log(error);
    }
}

const productinsert = async (req, res, next) => {

    try {

        const categorydata = await Category.find({})
        const images = req.files.map((file) => {
            return file.filename
        })
        const Product = new product({
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            brand: req.body.brand,
            description: req.body.description,
            quantity: req.body.quantity,
            image: images
        });

        const productData = await Product.save();
        const allp = await product.find({
            soft_delete: false
        })
        if (productData) {
            res.render('product', {
                adminlog: true,
                product: allp,
                message: "Successfull"
            })
        }
        res.render("product", {
            adminlog: true,
            product: allp,
            message: "something wrong"
        })
    } catch (error) {
        console.log(error);
    }

}

const updateProduct = async (req, res, next) => {
    try {
        const images = req.files.map((file) => {
            return file.filename
        })
        
        const id = req.body.id
        if (images) {
           
            const productData = await product.findOneAndUpdate({
                _id: id
            }, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.price,
                    description: req.body.description,
                    // image:images,
                    quantity: req.body.quantity
                },
                $push: {
                    image:  images ? images :[],
                  },
        
            });
        } else {
            const productData = await product.findByIdAndUpdate({
                _id: id
            }, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.price,
                    description: req.body.description,
                    quantity: req.body.quantity
                }
            });
        }

        res.redirect('/admin/product');
    } catch (error) {
        console.log(error);
    }
}

const loadEditproduct = async (req, res, next) => {
    try {
        const id = req.query.id
        const productData = await product.findById({
            _id: id
        })
        if (productData) {
            res.render('edit-product', {
                adminlog: true,
                product: productData
            })
        } else {
            res.redirect('/admin/product')
        }
    } catch (error) {
        console.log(error)
    }


}

const deleteProduct = async (req, res, next) => {
    try {
        const id = req.query.id;
        const productData = await product.updateOne({
            _id: id
        }, {
            soft_delete: true
        });
        res.redirect('/admin/product');
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    loadProduct,
    productAdd,
    productinsert,
    updateProduct,
    loadEditproduct,
    deleteProduct
}