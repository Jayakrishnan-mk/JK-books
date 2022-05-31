const mongoose = require('mongoose');

const shemaCart = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb'
    },
    products: Array

});

const cartModel = mongoose.model('cartdb', shemaCart);

module.exports = cartModel;