const mongoose = require('mongoose');

const connectDB = async () => {

    const con = await mongoose.connect('mongodb://localhost:27017/jkbooks',(err,data)=>{
        if(err){
            console.log("Could not connect to database");
        } 
        else{
            console.log("Connected to database");
        }
    })
}

module.exports = connectDB;