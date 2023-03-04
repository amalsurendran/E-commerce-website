
require('dotenv').config()

app.use(session({
    resave: false,
    secret: process.env.sessionSecret,
    saveUninitialized: false,
    cookie: {
        maxAge: 360000,
        sameSite: false
    }
}));