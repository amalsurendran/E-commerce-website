const banner = require('../Models/bannerModel')

const loadBanner = async (req, res,next) => {
    try {
        const bannerData = await banner.find({})
        res.render('banner', { banner: bannerData, adminlog: 1 });
    } catch (error) {
        next(error);
    }
}
const loadaddBanner = async (req, res,next) => {
    try {
        res.render('add-banner', { adminlog: 1 });
    } catch (error) {
        next(error);
    }
}
const insertBanner = async (req, res,next) => {
    try {
        const Banner = new banner({
            name: req.body.name,
            image: req.file.filename
        });

        const bannerData = await Banner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        next(error);
    }
}
const editBanner = async (req, res,next) => {
    try {
        const id = req.query.id
        const bannerData = await banner.findById({ _id: id })
        res.render('edit-banner', { banner: bannerData, adminlog: 1 });

    } catch (error) {
        next(error);
    }
}


module.exports ={
    loadBanner,
    loadaddBanner,
    insertBanner,
    editBanner
}