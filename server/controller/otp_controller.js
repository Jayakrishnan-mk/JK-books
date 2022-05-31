const Userdb = require('../model/model');

const serviceSID = "VA75b5e7e997850aab64166f43c82d9a0e";
const accountSID = "ACc126eca5b1a3058319ed7c5da0e1baea";
const authToken = "b4cd10e87bbf2e2ba0c88b84c6b6a567";

const client = require("twilio")(accountSID, authToken);

//otp page for user login............................................
exports.otpPage = async (req, res) => {

    const user = await Userdb.findOne({
        number: req.body.number
    })

    if (!user) {
        res.render('user/userLoginwithOtp', { error: "User not found" })
    }
    else {

        client.verify
            .services(serviceSID)
            .verifications.create({
                to: `+91${req.body.number}`,
                channel: "sms"
            })
            .then((resp) => {

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
                res.render('user/userLoginOtpCheck', { error: "Invalid OTP", number: req.body.number })
            }
        })
}