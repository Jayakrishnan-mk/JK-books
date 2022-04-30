const mongoose = require('mongoose');

const schemaCategories = new mongoose.Schema({
    name: {
        type: "string",
        required: true
    }
})

const Categorydb = mongoose.model('categorydb', schemaCategories);

module.exports = Categorydb;