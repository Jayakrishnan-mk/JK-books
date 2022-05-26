const express = require('express');
const userRouter = express.Router();
const controller = require('../controller/controller');
const wishlist_controller = require('../controller/wishlist_controller');
const cart_controller = require('../controller/cart_controller');
const order_controller = require('../controller/order_controller');
const otp_controller = require('../controller/otp_controller');
const product_controller = require('../controller/product_controller');
const saveAddress_controller = require('../controller/saveAddress_controller');


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

//user login error............................................
userRouter.get('/user-login-error', (req, res) => {
    if (req.session.isUserlogin) {
        res.redirect('/user-home')
    }
    else {
        res.render('user/user_login', { error: "Invalid User ! Email or Password was incorrect." })
    }
})

//user signup............................................
userRouter.get('/user-signup', (req, res) => {
    res.render('user/user_signup', { error: "" })
})

// userRouter.get('/user-signup-validation', (req, res) => {
//     console.log('kkkkkkkkkk', error.error.details[0].message);
//     res.render('user/user_signup', { error: error.error.details[0].message })
// })

//user home.............................................
userRouter.post('/user-signup', controller.userSignup);


//product details..........................................

userRouter.get('/product-details', product_controller.productDetails);


//user login with otp....................
userRouter.get('/loginwithOtp', (req, res) => {
    console.log('login with otp');
    res.render('user/userLoginwithOtp')
})



//login with otp....................
userRouter.post('/mobile', otp_controller.otpPage);

//otp checks....................
userRouter.post('/otp', otp_controller.otpChecking);


//user home page............................................
userRouter.post('/user-home', controller.userHomePost);

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
// userRouter.get('/user-home', controller.userHomeGet);



userRouter.get('/user-logout', async (req, res) => {
    // req.session.destroy();
    // // res.render('user/user_login', {logout: "User Logged out successfully."})
    // const products = await Productdb.find()
    // res.render('landing', { products })

    req.session.isUserlogin = false;
    req.session.user = null;
    res.redirect('/')
})



//user cart....................
userRouter.get('/add-to-cart/:id', cart_controller.addToCart);

//cart..........................................
userRouter.get('/cart', cart_controller.cart);

//product remove in cart ......................................
userRouter.post('/pro-remove', product_controller.productRemove);

//product quantity changing....................................
userRouter.post('/change-product-quantity', product_controller.changeProductQuantity);

//adding to wishlist..................................
userRouter.get("/add-to-wishlist/:id", verifyLogin, wishlist_controller.addToWishlist);

//place order............................................. 
userRouter.get('/place-order', product_controller.placeOrder);

//place order route from product details and direct buy now btn route..
userRouter.get('/place-order-direct' , product_controller.placeOrderDirect);
 
//checkout page..............................................
userRouter.post('/checkout', order_controller.checkout);  

//checkout page from buynow..............................................
userRouter.post('/checkoutFromBuynow', order_controller.checkoutFromBuynow);
 
//payment of razorpay..................................
userRouter.post('/verify-payment', order_controller.verifyPayment);

//order list..............................................
userRouter.get('/order-success', order_controller.orderSuccess);

userRouter.get('/my-orders', order_controller.myOrders);

userRouter.get('/my-profile', controller.myProfile);

userRouter.get('/my-wishlist', wishlist_controller.myWishlist);

userRouter.put ('/wishlist-removed', wishlist_controller.wishlistRemoved);

userRouter.get('/cancel-order/:id' , order_controller.cancellingOrder)

userRouter.post('/profile-edit', controller.profileEdit);

userRouter.post('/save-address', saveAddress_controller.saveAddress);
 
module.exports = userRouter;
