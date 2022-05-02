const mongoose = require('mongoose'); 
  
const schemaAdmin = new mongoose.Schema({
    email: {
        type: "string",
        required: true,
        unique: true
    },
    password: {
        type: "string",
        required: true
    },
},
    { collection: "admin" });

    const admin = mongoose.model('admin', schemaAdmin);

    module.exports = admin; 

