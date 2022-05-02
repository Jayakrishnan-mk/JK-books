const mongoose = require('mongoose');

const shemaCart = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb'
    },
    product: Array

});

const cartModel = mongoose.model('cartdb', shemaCart);

module.exports = cartModel;