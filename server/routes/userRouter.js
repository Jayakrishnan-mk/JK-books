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
        res.redirect('/user/user-home')
    }
    else {
        res.render('user/user_login')
    }
})

//user signup............................................
userRouter.get('/user-signup', (req, res) => {
    res.render('user/user_signup')
})



userRouter.get('/product-details', async (req, res) => {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    const products = await Productdb.findById(req.query.id)
    console.log("products>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", products);
    res.render('user/user_productDetails', { products })

})
//middleware for route protect..................
// userRouter.use((req,res,next) => {
//     if(!req.session.isUserlogin){
//         res.redirect('/')
//     }
//     else{
//         next();
//     }
// })
 
//user home page............................................
userRouter.post('/user-home', async (req, res) => {

    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if (user) {
        req.session.user = user;
        req.session.isUserlogin = true;

        const products = await Productdb.find()
        // console.log(products);
        res.status(200).redirect('/user-home')

    }
    else {
        res.status(403).redirect('user/user-login')
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

//product details....................

//user login with otp....................
userRouter.get('/loginwithOtp', (req, res) => {
    res.render('user/userLoginwithOtp')
})

userRouter.get('/user-logout', async (req, res) => {
    req.session.destroy();
    // res.render('user/user_login', {logout: "User Logged out successfully."})
    const products = await Productdb.find()
    res.render('landing', { products })
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
    console.log(userId);
    console.log('userid printed...................................');
    const proId = req.params.id;
    console.log("productid...............................", proId);
    const userCart = await Cartdb.findOne({ user: objectId(userId) })
    
    const product = { 
        id: proId,
        quantity: 1
    }

    if (userCart) {
        const cart = await Cartdb.updateOne({ userId: objectId(userId) },
        
            { $push: { products: product } } )
    
    }
    
    else {
        const cart = new Cartdb({
            userId: objectId(userId),
            products: [product]
        })
        // await Cartdb.insertOne({ user: userId, product: product })
        cart
        .save()
        console.log('cart saved...................................');
    }
    
    
})



userRouter.get('/cart', async (req,res) => {

    const userId = req.session.user?._id;
    console.log(userId);
    let cartItems = await  Cartdb.aggregate([
        { 
            $match:{userId:objectId(userId)}
            
        },
        {
            $unwind: "$products"
        },
        // {
        //     $lookup: { 
        //         from: "productdbs",
        //         let : {proList: '$products'},
        //         pipeline: [
        //             {
        //                 $match: {
        //                     $expr: {
        //                         $in: ['$_id', '$$proList']
        //                     }
        //                 }
        //             }
        //         ],
        //         as: 'cartItems'
        //     }
        // }
    ])
    console.log("cartItems---" , cartItems); 

    const products = Productdb.find()
    res.render('user/cart', {products})
  
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


  

module.exports = userRouter;
