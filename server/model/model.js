const mongoose = require('mongoose');

const schema = new mongoose.Schema({ 
    name: {
        type: "string",
        required: true
    },
    email: {
        type: "string",
        required: true,
        unique: true
    },
    password: {
        type: 'string',
        required: true
    },
    number: {
        type: "number",
        required: true,
        unique: true
    },
    gender: "string",
    isBlocked: {
        type: "boolean",
        default: false
    },
    // wishlist: [{productId: { type: mongoose.Types.ObjectId(),ref:"productdb" }}]

})

const Userdb = mongoose.model('userdb', schema);

module.exports = Userdb;
