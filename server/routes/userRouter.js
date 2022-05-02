const express = require('express');
const userRouter = express.Router();
const controller = require('../controller/controller');
const Userdb = require('../model/model');
const Productdb = require('../model/product_model');
const Cartdb = require('../model/cart_model');

const serviceSID = "VA75b5e7e997850aab64166f43c82d9a0e";
const accountSID = "ACc126eca5b1a3058319ed7c5da0e1baea";
// const authToken = "83608ae88cbea48400f9d5d386bfde6b";
const authToken = "59cc916f1fcf219db72e57080cc4c32b"
const client = require("twilio")(accountSID,authToken);
 

//user login............................................
userRouter.get('/user-login',(req,res) => {
    if(req.session.isUserlogin){
        res.redirect('/user/user-home')
    }
    else{
    res.render('user/user_login')
    }
}) 

//user signup............................................
userRouter.get('/user-signup',(req,res) => {
    res.render('user/user_signup')
})


//user home page............................................
userRouter.post('/user-home',async (req,res) => {
    
    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if(user){
        req.session.user = req.body.email;
        req.session.isUserlogin = true;
        
        const products = await Productdb.find()
        // console.log(products);
            res.status(200).redirect('/user-home')
        
    }
    else{
        res.status(403).redirect('user/user-login')
    }
})  


//user home page............................................
userRouter.get('/user-home',async (req,res) => {
    
    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if(user){
        req.session.user = req.body.email;
        req.session.isUserlogin = true;
        
        const products = await Productdb.find()
        // console.log(products);
            res.status(200).render('user/user_home', {products})
        
    }
    else{
        res.redirect('/')
    }
})  


//user home.............................................
userRouter.post('/user-signup',(req,res) => {
    console.log(req.body);
    //validate request
    if(!req.body){
        res.status(400).send({message: "Content can not be empty"});
        return;
    }

    //new user
    const user = new Userdb({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        number: req.body.number,
        gender:req.body.gender
    })

    user
    .save(user)
    .then(data => {
        res.redirect('/user-login')
    })
    .catch(error => {
        res.send({message: error})
    })
})

//product details....................
userRouter.get('/product-details',async (req,res)=>{
    const products=await Productdb.findById(req.query.id)
    console.log(products); 
    res.render('user/user_productDetails',{products})
   
}) 

//user login with otp....................
userRouter.get('/loginwithOtp',(req,res) => {
    res.render('user/userLoginwithOtp') 
})

userRouter.get('/user-logout',async (req,res) => {
    req.session.destroy();
    // res.render('user/user_login', {logout: "User Logged out successfully."})
    const products =await Productdb.find()
    res.render('landing',{products})
})


//login with otp....................
userRouter.post('/mobile',(req,res) => {
    console.log(req.body.number); 
    client.verify
    .services(serviceSID) 
    .verifications.create({
        to: `+91${req.body.number}`,
        channel: "sms"
    })
    .then((resp) => {
        console.log("response", resp);
        

        res.render('user/userLoginOtpCheck', {number: req.body.number})

        res.status(200).json({ resp })
    }) 
})

//otp checks....................
userRouter.post('/otp',(req,res) => {
 
    const otp = req.body.otp;
    client.verify
        .services(serviceSID) 
        .verificationChecks.create({
        
        to: `+91${req.body.number}`,
        code: otp,
    })
    .then(resp => {
        console.log("response", resp);
        if(resp.valid){
            Productdb.find()
            .then((products) => {
                res.status(200).render('user/user_home', {products})
            })
        } 
        else{
            res.render('user/userLoginOtpCheck', {error: "Invalid OTP",number: req.body.number})
        }
    })
})

//user cart....................
userRouter.get('/user-cart', async (req,res) => {
    const products = await  Productdb.find()
    console.log("products",products);
    if(req.session.isUserlogin){
        res.render('user/user_cart', {products})
    }
    else{
    res.redirect('/')
    }
})

userRouter.post('/user-cart', (req,res) => {
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
        res.redirect('/user-cart')
    })
    .catch(error => {
        res.send({message: error})
    })
})


  

module.exports = userRouter;
