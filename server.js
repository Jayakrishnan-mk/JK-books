const express = require('express');
const methodOverride = require('method-override');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const fileUpload = require('express-fileupload');

const connectDB = require('./server/database/connection');

const Userdb = require('./server/model/model');
const Productdb = require('./server/model/product_model');
const Cartdb = require('./server/model/cart_model')
const Wishlistdb = require('./server/model/wishlist_model')
const objectId = require('mongoose').Types.ObjectId;

const app = express();

dotenv.config();

const port = process.env.PORT;
//override the method in form......
app.use(methodOverride('_method'));

//log requests....................
app.use(morgan('tiny'));

//mongodb connection...............
connectDB();

//parse json bodies...............
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use('/css', express.static(path.join(__dirname, "public/assets/css")));
app.use('/bootstrap', express.static(path.join(__dirname, "public/assets/css/bootstrap")));
app.use('/theme', express.static(path.join(__dirname, "public/assets/css/theme")));
app.use('/img', express.static(path.join(__dirname, "public/assets/img")));
app.use('/fonts', express.static(path.join(__dirname, "public/assets/fonts")));
app.use('/js', express.static(path.join(__dirname, "public/assets/js")));
app.use('/public/product_images', express.static(path.join(__dirname, "public/product_images")))

app.use(fileUpload());

//...cache clearing............... 
app.use((req, res, next) => {
    if (!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
    }
    next();
})

//..session handling.............
app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}))

//....Home route......................
app.get('/', async (req, res) => {
    const products = await Productdb.find()
    let count = 0;

    if (req.session.isUserlogin) {
        const user = req.session.user;
        const userHome = await Userdb.findOne({ _id: user._id })
        const cartCount = await Cartdb.find({ userId: objectId(req.session.user._id) })
        count = cartCount[0]?.products?.length;

        const wishlist = await Wishlistdb.findOne({ userId: objectId(user._id) });

        res.render('user/user_home', { user, userHome, products, count, wishlist })
    }

    else {
        const products = await Productdb.find()
        res.render('landing', { products });
    }
})


// load routers...................
app.use('/admin', require('./server/routes/router'));
app.use('/', require('./server/routes/userRouter'));



app.use((req, res, next) => {
    res.status(404).render('error.ejs')
})

app.listen(port, () => { console.log(`Server running on http://localhost:${port}`); });

