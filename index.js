const express = require("express");
const hbs = require('express-handlebars')
const app = express();
const path = require('path')
const connectDb = require("./config/config")
const userRoute = require('./Route/userRoute')
const adminRoute = require('./Route/adminRount')
const session = require('express-session');
const { notFound, errorHandler } = require("./middeleware/errorhandler");
const auth = require('./middeleware/Auth')
const Handlebars =require('handlebars') 

connectDb.Db();


app.use(express.static(__dirname + '/public'))


app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
app.use('/admin', adminRoute);
app.use('/', userRoute);
app.set("views", path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials'
}))
app.use(session({
    resave: false,
    secret: connectDb.sessionSecret,
    saveUninitialized: false,
    cookie: {
        maxAge: 360000,
        sameSite: false
    }
}));



app.use(auth.cache)


Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

Handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


app.use("*", notFound);
app.use(errorHandler);


app.listen(3000, () => {
    console.log("Server Running");
})