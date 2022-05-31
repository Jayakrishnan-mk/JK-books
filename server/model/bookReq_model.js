const mongoose = require('mongoose');

const schemaBookRequests = new mongoose.Schema({

    bookDetails: {
        type: "string",
        required: true
    },
    name: {
        type: "string",
        required: true
    },
    email: {
        type: "string",
        required: true
    },
    address: {
        type: "string",
        required: true
    },
    phone: {
        type: "number",
        required: true
    }
})

const BookRequestdb = mongoose.model('bookRequestdb', schemaBookRequests);

module.exports = BookRequestdb; 