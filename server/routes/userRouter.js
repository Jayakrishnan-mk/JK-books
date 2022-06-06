const express = require('express');
const userRouter = express.Router();
const controller = require('../controller/controller');
const wishlist_controller = require('../controller/wishlist_controller');
const cart_controller = require('../controller/cart_controller');
const order_controller = require('../controller/order_controller');
const otp_controller = require('../controller/otp_controller');
const product_controller = require('../controller/product_controller');
const saveAddress_controller = require('../controller/saveAddress_controller');
const coupon_controller = require('../controller/coupon_controller');


// const verifyLogin = (req, res, next) => {

//     if (req.session.isUserlogin) {
//         next();
//     }
//     else {
//         res.redirect('/user-login');
//     }
// }


//user login............................................
userRouter.get('/user-login', (req, res) => {

    if (req.session.isUserlogin) {
        res.redirect('/user-home')
    }
    else {
        const error = req.session.error;
        req.session.error = null;

        res.render('user/user_login', { error });
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

//user home.............................................
userRouter.post('/user-signup', controller.userSignup);

// signup validation............................................
userRouter.get('/signup-error', controller.signupError);

//product details..........................................
userRouter.get('/product-details', product_controller.productDetails);

//user login with otp....................
userRouter.get('/loginwithOtp', (req, res) => {
    res.render('user/userLoginwithOtp')
})

//user login with otp check....................
userRouter.get('/user-loginWithOtpChecking', otp_controller.userLoginWithOtpChecking);

//login with otp....................
userRouter.post('/mobile', otp_controller.otpPage);

//otp checking for user login....................
userRouter.get('/user-loginWithOtp', otp_controller.otpPageLogin);

//otp checking for user login....................
userRouter.get('/user-loginOtpChecking', otp_controller.otpLoginChecking);

//otp checks....................
userRouter.post('/otp', otp_controller.otpChecking);

//user home page............................................
userRouter.post('/user-home', controller.userHomePost);

//user book request get............................................
userRouter.get('/book-req', controller.bookRequest);

//user book request post............................................
userRouter.post('/book-request', controller.bookRequestPost);

//middleware for route protect..................
// userRouter.use((req, res, next) => {

//     if (!req.session.isUserlogin) {
//         res.redirect('/')
//     }
//     else {
//         next();
//     }
// })


//user logout............................................
userRouter.get('/user-logout', async (req, res) => {

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
userRouter.get('/place-order-direct', product_controller.placeOrderDirect);

//checkout page..............................................
userRouter.post('/checkout', order_controller.checkout);

//checkout page from buynow..............................................
userRouter.post('/checkoutFromBuynow', order_controller.checkoutFromBuynow);

//coupon applying..............................................
userRouter.post('/coupon-apply', coupon_controller.couponApply);

//payment of razorpay..................................
userRouter.post('/verify-payment', order_controller.verifyPayment);

//order list..............................................
userRouter.get('/order-success', order_controller.orderSuccess);

//my orders list..............................................
userRouter.get('/my-orders', order_controller.myOrders);

// my profile page..............................................
userRouter.get('/my-profile', controller.myProfile);

//my wishlist page..............................................
userRouter.get('/my-wishlist', wishlist_controller.myWishlist);

//wishlist removing..............................................
userRouter.put('/wishlist-removed', wishlist_controller.wishlistRemoved);

//my cancelling order..............................................
userRouter.get('/cancel-order/:id', order_controller.cancellingOrder)

//edit profile..............................................
userRouter.post('/profile-edit', controller.profileEdit);

//users address saving.......................................
userRouter.post('/save-address', saveAddress_controller.saveAddress);


module.exports = userRouter;
