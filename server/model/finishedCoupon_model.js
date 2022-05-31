const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb'
    },
    coupon: {
        type: 'string',
        required: true
    }
})

const finishedCoponModel = mongoose.model('finishedCoupondb', couponSchema);

module.exports = finishedCoponModel;