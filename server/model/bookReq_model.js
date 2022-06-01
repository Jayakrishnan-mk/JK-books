const mongoose = require('mongoose');

const schemaBookRequests = new mongoose.Schema({

    bookDetails: {
        type: "string"
    },
    name: {
        type: "string"
    },
    email: {
        type: "string"
    },
    address: {
        type: "string"
    },
    phone: {
        type: "number"
    }
})

const BookRequestdb = mongoose.model('bookRequestdb', schemaBookRequests);

module.exports = BookRequestdb; 