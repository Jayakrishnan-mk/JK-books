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


    let deliveryObj = {
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        mobile: req.body.mobile
    }

    // console.log(deliveryObj);

    const error = validate(deliveryObj)

    let orderItems = new Orderdb({
        userId: objectId(userId),
        deliveryDetails: deliveryObj,
        paymentMethod: req.body.paymentMethod,
        date: new Date(),
        totalAmount: req.body.total,
        status: 'dispatched',
        products: cartItems?.products[0]
    })

    // console.log(orderItems.totalAmount, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
    // console.log("error",  error.error.details[0].message);

    if (error.error) {

        // console.log('roororooror', error);

        let errorMsg = error.error?.details[0].message;

        // res.render('user/place_order', { error: errorMsg ,user: req.session.user , total: orderItems.totalAmount })

        res.json({ total: orderItems.totalAmount, error: errorMsg })
    }

    else {

        // console.log('errorroorororo');
        orderItems
            .save();

        // console.log('product quantity decreasing before.................');

        await Productdb.updateOne({ "_id": objectId(orderItems.products[0]?.id) },
            {
                $inc: { "quantity": -cartItems.products[0]?.quantity }
            }
        )

        if (orderItems.paymentMethod === 'COD') {


            await Cartdb.deleteOne({ userId: objectId(userId) })

            // console.log("orderItems ======", orderItems);

            res.json({ codSuccess: true })

            // res.render('user/order_success')
        }
        else {

            console.log("orderItems ======", orderItems);
            const orderId = orderItems._id;
            const amount = orderItems.totalAmount;


            var options = {
                amount: amount,
                currency: 'INR',
                receipt: orderId.toString()
            }

            // console.log(typeof(amount),"kkkkkkkkkkkkkkkkk");

            instance.orders.create(options, (err, order) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("New order========", order);
                    res.json({ order })
                }
            })

            // console.log("orderItems ======", orderItems);
            // const orderId = orderItems._id;



            // var options = {
            //     amount: amount * 100,
            //     currency: 'INR',
            //     receipt: orderId.toString()
            // }

            // console.log("options....", options);



            //         instance.orders.create(options, (err, order) => { 
            //             if (err) {
            //                 console.log("err>>>>>>>>>>>>>>>>>", err);
            //             }
            //             else {
            //                 console.log("New order========", order);
            //                 res.json(order);
            //             }
            //         })
        }
    }
}
// }

//payment of razorpay..............................................
// exports.verifyPayment = async (req, res) => {

//     console.log('successsssssssssssssssssss');

// }

// my orders page..............................................
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
    // console.log("ord-----", orderedProduct);

    res.render('user/my_orders', { orders: orderItems })
}


// delivery status in dropdown..............................................
exports.deliveryStatus = async (req, res) => {
    // console.log(',,,,,,,,,,',req.body);
    const status = req.body.status;
    const orderId = req.body.orderId;

    await Orderdb.updateOne({ _id: objectId(orderId) },
    {
        $set: {
            status: status
        }
    })
    console.log(status);
}

//payment of razorpay..............................................
exports.verifyPayment = async (req, res) => {
    console.log(req.body);
}

//order cancelling in userside..............................................
exports.cancellingOrder = async (req, res) => {
    const id = req.params.id;

    await Orderdb.updateOne({ _id: id },
        {
            $set: { status: 'cancelled' }
        })
    const order = await Orderdb.findOne({ _id: objectId(id) })
    const proId = order.products[0].id;

    await Productdb.updateOne({ "_id": objectId(proId) },
        {
            $inc: { quantity: 1 }
        }

    )

    res.redirect('/my-orders')

}

//order cancelling in adminside..............................................
exports.cancelOrderInAdminside = async (req, res) => {
    // console.log("cancel order in adminside..............");
    const orderId = req.params.id;

    await Orderdb.updateOne({ _id: orderId },
        {
            $set: { status: 'cancelled'}
        })
        const order = await Orderdb.findOne({ _id: objectId(orderId) })

        // console.log("order)))))))))))", order);
        const proId = order.products[0].id;

        await Productdb.updateOne({" _id": objectId(proId) },
        {
            $inc: { quantity : 1}
        })
        res.redirect('/admin/admin-ordersList')

}



const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(20).required().label("Name"),
        address: Joi.string().min(6).required().label("Address"),
        pincode: Joi.string().length(6).pattern(/^[0-9]+$/).required().label("Pincode"),
        mobile: Joi.string().min(10).max(13).pattern(/^[0-9]+$/).required().label("Mobile number"),
    })
    return schema.validate(data)
}

