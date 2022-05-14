const Productdb = require('../model/product_model');
const Cartdb = require('../model/cart_model');
const Userdb = require('../model/model');

const serviceSID = "VA75b5e7e997850aab64166f43c82d9a0e";
const accountSID = "ACc126eca5b1a3058319ed7c5da0e1baea";
const authToken = "abbe56981e2ca012e5cf588b59a48256"
const client = require("twilio")(accountSID, authToken);

//otp page for user login............................................
exports.otpPage = async (req, res) => {
    // console.log(req.body.number);

    const user = await Userdb.findOne({
        number : req.body.number
    })
    if(!user){
        res.render('user/userLoginwithOtp',{error: "User not found"})
    }
    else{

    client.verify
        .services(serviceSID)
        .verifications.create({
            to: `+91${req.body.number}`,
            channel: "sms"
        })
        .then((resp) => {
            // console.log("response", resp);


            res.render('user/userLoginOtpCheck', { number: req.body.number })

            res.status(200).json({ resp })
        })
    }
}

//otp checking for user login............................................
exports.otpChecking = (req, res) => {

    const otp = req.body.otp;
    client.verify
        .services(serviceSID)
        .verificationChecks.create({

            to: `+91${req.body.number}`,
            code: otp,
        })
        .then(resp => {
            // console.log("response", resp);
            if (resp.valid) {
                // Productdb.find()
                //     .then((products) => {
                        // res.status(200).render('user/user_home', { products })

                        // console.log('kkkkkkkkkkkkkkkk', req.body.number);
                        Userdb.findOne({
                            number: req.body.number
                        })
                        .then((user) => {
                            console.log('user3333333333333', user);
                            req.session.user = user;
                            req.session.isUserlogin = true;
                            res.redirect('/')

                        })
                
            }
            else {
                res.render('user/userLoginOtpCheck', { error: "Invalid OTP", number: req.body.number })
            }
        })
}