const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {} else {
           return res.redirect('/login');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}
const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
           return res.redirect('/home')
        }
        else
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isLogoutAdmin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
          return  res.redirect('/admin/admin-home')
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

const isLoginAdmin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {} else {
          return  res.redirect('/admin');
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
}

 const cache =   function (req, res, next) {
    res.header('Cache-Control', 'no-cache, no-store');
    next();
};


module.exports = {
    isLogin,
    isLogout,
    isLogoutAdmin,
    isLoginAdmin,
    cache
}