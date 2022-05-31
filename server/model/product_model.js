const mongoose = require('mongoose');

const schemaProducts = new mongoose.Schema({

    name: {
        type: "string",
        required: true
    },
    author: {
        type: "string",
        required: true
    },
    price: {
        type: "number",
        required: true
    },
    quantity: {
        type: "number",
        required: true
    },
    category: {
        type: "string",
        required: true
    },
    image: {
        type: "string",
    },
    description: "string"

})

const Productdb = mongoose.model('productdb', schemaProducts);

module.exports = Productdb;
