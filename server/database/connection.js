const mongoose = require('mongoose');

const connectDB = async () => {

    await mongoose.connect(`mongodb://${process.env.MONGOURL}`, (err, data) => {

        if (err) {
            console.log(err.message);
            console.log("Could not connect to database");
        }
        else {
            console.log("Connected to database");
        }
    })
}

module.exports = connectDB; 
