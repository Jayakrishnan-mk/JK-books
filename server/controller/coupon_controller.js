const Coupondb = require('../model/coupon_model');

exports.couponDetails = async (req, res) => {
    const coupons = await Coupondb.find();

    res.render('admin/coupon');
}