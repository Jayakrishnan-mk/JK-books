const mongoose = require('mongoose');

const schemaOrder = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb'
    },
    deliveryDetails: {
        type: Object,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    date : {
        type: Date,
        default: Date.now,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    }

});


const orderModel = mongoose.model('orderdb', schemaOrder);

module.exports = orderModel;