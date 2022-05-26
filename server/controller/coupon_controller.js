const Coupondb = require('../model/coupon_model');
const Joi = require('joi')

//coupon details..........................................................
exports.couponDetails = async (req, res) => {
    const coupons = await Coupondb.find();

    res.render('admin/coupon', { coupons });
}

//add coupon get..................................
exports.addCoupon = async (req, res) => {
    // console.log('couponssssssssssssssssss');
    res.render('admin/add_coupon', { errorMsg: "" });
}

//adding new coupon..................................
exports.addingCoupon = async (req, res) => {

    const couponObj = {
        coupon: req.body.coupon,
        percentage: req.body.percentage,
        min: req.body.min,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate
    }

    const error = addValidate(couponObj);

    const coupon = new Coupondb(couponObj);

    if (error.error) {
        let errorMsg = error.error.details[0].message;
        res.render('admin/add_coupon', { errorMsg });
    }
    else {
        await coupon.save();
        // console.log('saveddddddddddddddddddddddddddddddddddddddddd');
        res.redirect('/admin/coupon');
    }
}

//update coupon ..................................
exports.updateCoupon = async (req, res) => {
    const couponId = req.params.id;
    // console.log('couponId', couponId);

    const coupon = await Coupondb.findById(couponId);
    res.render('admin/update_coupon', { coupon, errorMsg: "" });
}

//updating coupon put..................................
exports.updatingCoupon = async (req, res) => {
    const couponId = req.params.id;
    // console.log('couponId>>>>>>>>>>>>>', couponId);

    const couponObj = {
        coupon: req.body.coupon,
        percentage: req.body.percentage,
        min: req.body.min,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate

    } 
    // console.log('couponObj>>>>>>>>>>>>>', couponObj);

    const error = addValidate(couponObj);

    if (error.error) {
        let errorMsg = error.error.details[0].message;
        // const coupon = await Coupondb.findById(couponId);
        // res.render('admin/update_coupon', { coupon, errorMsg });


        req.session.errorMsg = errorMsg;
        req.session.couponId = couponId;


        res.redirect('/admin/couponErrorVal');

    }
    else {
        await Coupondb.findByIdAndUpdate(couponId, couponObj);
        res.redirect('/admin/coupon');
    }

}

//error validation coupon updating....................................
exports.couponErrorVal = async (req, res) => {
    const couponId = req.session.couponId;
    const errorMsg = req.session.errorMsg;
    const coupon = await Coupondb.findById(couponId);
    // console.log('errorMsg7777777777', errorMsg);
    console.log('coupon77777777', coupon);
    res.render('admin/update_coupon', { coupon, errorMsg });
}

//delete coupon..................................
exports.deleteCoupon = async (req, res) => {

    const couponId = req.params.id;
    // console.log('couponId', couponId);

    await Coupondb.findByIdAndDelete(couponId);
    res.redirect('/admin/coupon');

}

//coupon status activating..................................
exports.couponStatus = async (req, res) => {

    const couponId = req.params.id;
    // console.log('couponId', couponId);

    const coupon = await Coupondb.findById(couponId)
    if (coupon.status) {
        await Coupondb.findByIdAndUpdate(couponId, { status: false });

    }
    else {
        await Coupondb.findByIdAndUpdate(couponId, { status: true });
    }
    setTimeout(() => {

        res.redirect('/admin/coupon');
    }, 2000);
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>   user side coupon apply   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
exports.couponApply = async (req, res) => {

    const code = req.body.code;
    const total = req.body.total;
    // console.log('code', code);

    const coupon = await Coupondb.findOne({ coupon: code , status: true});
    if(coupon) {
        console.log('coupon', coupon);
        if(coupon.min < total) {
            const discount = (coupon.percentage / 100) * total;
            const newTotal = total - discount;
            res.json({ newTotal });
        }
        else {
            res.json({error: `minimum purchase is  ${coupon.min}`})
        }
    }
    else {
        res.json({error: 'Coupon Invalid'});
    } 
}



//validation for adding a new product....................................
const addValidate = (data) => {
    const schema = Joi.object({
        coupon: Joi.string().required().label("Name"),
        percentage: Joi.number().min(1).max(99).required().label("Percentage"),
        min: Joi.number().required().label("Min.Purchase"),
        fromDate: Joi.date().required().label("From Date"),
        toDate: Joi.date().required().label("To Date"),
    })
    return schema.validate(data)
}