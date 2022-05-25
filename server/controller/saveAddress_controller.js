const SavedAddressdb = require('../model/savedAddress_model');
const objectId = require('mongoose').Types.ObjectId;

//address saving.................................................
exports.saveAddress = async (req,res) => {
   
    const saveObject = {
        userId: objectId(req.session.user._id),
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        mobile: req.body.mobile
    }

// console.log('ssssssssssssssss', saveObject);
    const savedAddress = new SavedAddressdb(saveObject);
    await savedAddress.save();

}