const mongoose = require('mongoose');

const schemaWishlist = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdb'
    },
    products: Array
});

const wishlistModel = mongoose.model('wishlistdb', schemaWishlist);

module.exports = wishlistModel;