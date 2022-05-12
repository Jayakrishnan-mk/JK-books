const Orderdb = require('../model/order_model');
const Cartdb = require('../model/cart_model');
const Productdb = require('../model/product_model');
const Userdb = require('../model/model');
const Joi = require('joi');
const Razorpay = require('razorpay');

const objectId = require('mongoose').Types.ObjectId;


var instance = new Razorpay({
    key_id: 'rzp_test_ypSBEwW22pVLiL',
    key_secret: 'ycRd6fwBkLO7GmZGjm2REW9a'
})


//checkout page....................................
exports.checkout = async (req, res) => {
    // console.log("req.body//////////////", req.body);
    const userId = req.session.user._id;
    // console.log("userId-----", userId);
    const cartItems = await Cartdb.findOne({
        userId: objectId(userId)

    })
    // console.log("cartItems-----", cartItems);

    // console.log("cartItems product----->>>>", cartItems?.products[0]);

    // console.log("req.body======", req.body);

    // console.log('ordered items....... available');

    let deliveryObj = {
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        mobile: req.body.mobile
    }

    let orderItems = new Orderdb({
        userId: objectId(userId),
        deliveryDetails : deliveryObj,
        paymentMethod: req.body.paymentMethod,
        date: new Date(),
        totalAmount: req.body.total,
        status: 'dispatched',
        products: cartItems?.products[0]
    })

    const { error } = validate(deliveryObj)
    // if (error) {
    //     return res.send(error.details[0].message)
    // }

    orderItems
        .save();    

    await Productdb.updateOne({ "_id": objectId(orderItems.products[0].id) },
        {
            $inc: { "quantity": -cartItems.products[0].quantity }
        }
    )

    await Cartdb.deleteOne({ userId: objectId(userId) })

    if (orderItems.paymentMethod === 'COD') {

        // console.log("orderItems ======", orderItems);

        res.json({ codSuccess: true })

        res.render('user/order_success')
    }
    else {
        // console.log("orderItems ======", orderItems);
        const orderId = orderItems._id;
        const amount = orderItems.totalAmount;


        var options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: orderId.toString()
        }

        // console.log("options....", options);



        instance.orders.create(options, (err, order) => {
            if (err) {
                console.log("err>>>>>>>>>>>>>>>>>", err);
            }
            else {
                console.log("New order========", order);
                res.json(order);
            }
        })
    }
}

//payment of razorpay..............................................
exports.verifyPayment = async (req, res) => {
    // console.log("req.body -- payment,order..........." , req.body);
    res.redirect('/order-success')
}

//my orders page..............................................
exports.myOrders = async (req, res) => {


    const orderItems = await Orderdb.aggregate([
        {
            $match: {
                userId: objectId(req.session.user._id)
            }
        },
        {
            $lookup: {
                from: "productdbs",
                localField: "products.id",
                foreignField: '_id',
                as: 'orderProducts'
            }
        }


    ])

    const orderedProduct = orderItems[0].orderProducts[0];
    console.log("ord-----", orderedProduct);

    res.render('user/my_orders', { orderItems })
}




const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Name"),
        address: Joi.string().required().label("Address"),
        pincode: Joi.string().length(6).pattern(/^[0-9]+$/).required().label("Pincode"),
        mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required().label("Mobile number"),
    })
    return schema.validate(data)
}
