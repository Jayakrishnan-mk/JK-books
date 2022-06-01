const Userdb = require('../model/model');

const serviceSID = "VA75b5e7e997850aab64166f43c82d9a0e";
const accountSID = "ACc126eca5b1a3058319ed7c5da0e1baea";
const authToken = "dffd0695bfc546426e82d0aca5f4607a";

const client = require("twilio")(accountSID, authToken);

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<       otp page for user login         >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
exports.otpPage = async (req, res) => {

    const user = await Userdb.findOne({
        number: req.body.number
    })

    if (!user) {
        const error = "User not found";
        req.session.error = error;
        res.redirect('/user-loginWithOtp')
    }
    else {

        client.verify
            .services(serviceSID)
            .verifications.create({
                to: `+91${req.body.number}`,
                channel: "sms"
            })
            .then((resp) => {
                req.session.number = req.body.number;
                res.redirect('/user-loginOtpChecking')
            })
    }
}


exports.otpPageLogin =  (req,res)=>{
    const error = req.session.error;
    req.session.error = null;
    res.render('user/userLoginwithOtp', { error })
}

exports.otpLoginChecking = (req,res) => {
    const number = req.session.number;
    req.session.number = null;
    res.render('user/userLoginOtpCheck', { number })

}

exports.userLoginWithOtpChecking = (req,res) => {

    const error = req.session.error;
    const number = req.session.number;
    req.session.number = null;
    req.session.error = null;
    res.render('user/userLoginOtpCheck', { error, number })

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
            if (resp.valid) {

                Userdb.findOne({
                    number: req.body.number
                })
                    .then((user) => {
                        req.session.user = user;
                        req.session.isUserlogin = true;
                        res.redirect('/')

                    })

            }
            else {
                const error = "Invalid OTP";
                const number = req.body.number;
                res.redirect('/user-loginWithOtpChecking');
            }
        })
}