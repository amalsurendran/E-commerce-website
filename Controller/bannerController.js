const banner = require('../Models/bannerModel')

const loadBanner = async (req, res) => {
    try {
        const bannerData = await banner.find({})
        res.render('banner', { banner: bannerData, adminlog: 1 });
    } catch (error) {
        console.log(error);
    }
}
const loadaddBanner = async (req, res) => {
    try {
        res.render('add-banner', { adminlog: 1 });
    } catch (error) {
        console.log(error);
    }
}
const insertBanner = async (req, res) => {
    try {
        const Banner = new banner({
            name: req.body.name,
            image: req.file.filename
        });

        const bannerData = await Banner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error);
    }
}
const editBanner = async (req, res) => {
    try {
        const id = req.query.id
        const bannerData = await banner.findById({ _id: id })
        res.render('edit-banner', { banner: bannerData, adminlog: 1 });

    } catch (error) {
        console.log(error);
    }
}


module.exports ={
    loadBanner,
    loadaddBanner,
    insertBanner,
    editBanner
}