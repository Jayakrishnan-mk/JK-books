const mongoose = require('mongoose');

const savedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb'
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
});

const savedAddressModel = mongoose.model('savedAddressDb', savedSchema);

module.exports = savedAddressModel;


