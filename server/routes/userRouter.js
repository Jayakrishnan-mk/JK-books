const express = require('express');
const userRouter = express.Router();
const controller = require('../controller/controller');
const Userdb = require('../model/model');
const Productdb = require('../model/product_model');
const Cartdb = require('../model/cart_model');
const { resolve } = require('path');
const objectId = require('mongoose').Types.ObjectId;

const serviceSID = "VA75b5e7e997850aab64166f43c82d9a0e";
const accountSID = "ACc126eca5b1a3058319ed7c5da0e1baea";
const authToken = "59cc916f1fcf219db72e57080cc4c32b"
const client = require("twilio")(accountSID, authToken);

const verifyLogin = (req, res, next) => {
    if (req.session.isUserlogin) {
        next();
    }
    else {
        res.redirect('/user-login');
    }
}


//user login............................................
userRouter.get('/user-login', (req, res) => {
    if (req.session.isUserlogin) {
        res.redirect('/user-home')
    }
    else {
        res.render('user/user_login')
    }
})

//user signup............................................
userRouter.get('/user-signup', (req, res) => {
    res.render('user/user_signup')
})


//user home.............................................
userRouter.post('/user-signup', (req, res) => {
    console.log(req.body);
    //validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty" });
        return;
    }

    //new user
    const user = new Userdb({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        number: req.body.number,
        gender: req.body.gender
    })

    user
        .save(user)
        .then(data => {
            res.redirect('/user-login')
        })
        .catch(error => {
            res.send({ message: error })
        })
})


//product details..........................................

userRouter.get('/product-details', async (req, res) => {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    const products = await Productdb.findById(req.query.id)
    console.log("products>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", products);

    // const count = cartCount[0].products.length;

    const count = null;
    if (req.session.user) {
        const cartCount = await Cartdb.find({ userId: objectId(req.session.user._id) })
        const count = cartCount[0]?.products?.length;
        res.render('user/user_productDetails', { products, count })
    }

    res.render('user/user_productDetails', { products, count })
})

//user home page............................................
userRouter.post('/user-home', async (req, res) => {

    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if (user) {
        req.session.user = user;
        req.session.isUserlogin = true;
        res.status(200).redirect('/')

    }
    else {
        res.status(403).redirect('/user-login')
    }
})

//middleware for route protect..................
userRouter.use((req, res, next) => {
    if (!req.session.isUserlogin) {
        res.redirect('/')
    }
    else {
        next();
    }
})


//user home page............................................
userRouter.get('/user-home', async (req, res) => {

    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if (user) {
        req.session.user = req.body.email;
        req.session.isUserlogin = true;

        const products = await Productdb.find()
        // console.log(products);
        res.status(200).render('user/user_home', { products })

    }
    else {
        res.redirect('/')
    }
})


//user login with otp....................
userRouter.get('/loginwithOtp', (req, res) => {
    res.render('user/userLoginwithOtp')
})

userRouter.get('/user-logout', async (req, res) => {
    // req.session.destroy();
    // // res.render('user/user_login', {logout: "User Logged out successfully."})
    // const products = await Productdb.find()
    // res.render('landing', { products })

    req.session.isUserlogin = false;
    req.session.user = null;
    res.redirect('/')
})


//login with otp....................
userRouter.post('/mobile', (req, res) => {
    console.log(req.body.number);
    client.verify
        .services(serviceSID)
        .verifications.create({
            to: `+91${req.body.number}`,
            channel: "sms"
        })
        .then((resp) => {
            console.log("response", resp);


            res.render('user/userLoginOtpCheck', { number: req.body.number })

            res.status(200).json({ resp })
        })
})

//otp checks....................
userRouter.post('/otp', (req, res) => {

    const otp = req.body.otp;
    client.verify
        .services(serviceSID)
        .verificationChecks.create({

            to: `+91${req.body.number}`,
            code: otp,
        })
        .then(resp => {
            console.log("response", resp);
            if (resp.valid) {
                Productdb.find()
                    .then((products) => {
                        res.status(200).render('user/user_home', { products })
                    })
            }
            else {
                res.render('user/userLoginOtpCheck', { error: "Invalid OTP", number: req.body.number })
            }
        })
})

//user cart....................
userRouter.get('/add-to-cart/:id', verifyLogin, async (req, res) => {
    const userId = req.session.user._id;
    console.log('userid printed...................................', userId);
    const proId = req.params.id;
    console.log("productid printed.................................", proId);

    const product = {
        id: objectId(proId),
        quantity: 1
    }

    const userCart = await Cartdb.findOne({ user: objectId(userId) })

    if (userCart) {
        let proExist = userCart.products.findIndex(product => product.id == proId)
        console.log("proExist-------------", proExist);

        if (proExist != -1) {
            console.log(objectId(proId));
            await Cartdb.updateOne({ userId: objectId(userId), 'products.id': objectId(proId) },
                {
                    $inc: { "products.$.quantity": 1 }
                })
            res.json({ status: true })
        }

        else {
            const cart = await Cartdb.updateOne({ userId: objectId(userId) },
                {
                    $push: { products: product }
                })
            res.json({ status: true })

        }
    }

    else {
        const cart = new Cartdb({
            userId: objectId(userId),
            products: [product]
        })
        cart
            .save()
        console.log('cart saved...................................');
        res.json({ status: true })
    }
})



userRouter.get('/cart', async (req, res) => {

    const userId = req.session.user?._id;
    console.log("userId-----", userId);
    let cartItems = await Cartdb.aggregate([
        {
            $match: { userId: objectId(userId) }

        },
        {
            $unwind: "$products"
        },
        {
            $project: {
                id: "$products.id",
                quantity: "$products.quantity"
            }

        },
        {
            $lookup: {
                from: "productdbs",
                localField: "id",
                foreignField: '_id',
                as: 'product'
            }
        }
    ])
    const pros = await Cartdb.find({ id: objectId(userId) })
    console.log("pros>>>>>>>>>>>>>>>>>>", pros[0]);
    console.log("cartItems---", cartItems[0]);



    res.render('user/cart', { products: cartItems, pros: pros[0] })

})

//product remove in cart ......................................
userRouter.get('/pro-remove/:id', async (req, res) => {
    const proId = req.params.id;
    console.log("proid--------", proId);
    const userId = req.session.user._id;
    await Cartdb.updateOne({ userId: objectId(userId) },

        {

            $pull: { products: { id: objectId(proId) } }

        })
    res.redirect('/cart');

})



userRouter.post('/add-to-cart', (req, res) => {
    console.log(req.body);

    //validate request
    const cart = new cartdb({
        product_id: req.body.product_id,
        object_id: req.body.object_id,
        quantity: 1
    })
    cart
        .save(cart)
        .then(data => {
            res.redirect('/add-to-cart')
        })
        .catch(error => {
            res.send({ message: error })
        })
})

//product quantity changing....................................
userRouter.post('/change-product-quantity', async (req, res) => {
    console.log("req.body----------", req.body);
    const cart = req.body.cart;
    const product = req.body.product;
    let count = req.body.count;
    let quantity = req.body.quantity;
    count = parseInt(count)
    quantity = parseInt(quantity)
    console.log("type of count ---",typeof(count));
    console.log("type of quantity ---",typeof(quantity));
    // console.log("quantity----------------",req.body.quantity);
    // console.log(count);  


    if(quantity == 1 && count == -1) {

        await Cartdb.updateOne({_id: objectId(cart)},
        {
            $pull : {products: {id: objectId(product)} }
        })
        res.json({status: true , removeProduct : true})
    }
    else{
    await Cartdb.updateOne({ cartId: objectId(cart), 'products.id': objectId(product) },
        {
            $inc: { "products.$.quantity": count }
        })
        res.json({ status: true })

    }
}

)


module.exports = userRouter;
