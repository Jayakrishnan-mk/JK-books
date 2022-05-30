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

    req.session.address = deliveryObj;

    // console.log(deliveryObj);



    const orderObject = {
        userId: objectId(userId),
        deliveryDetails: deliveryObj,
        paymentMethod: req.body.paymentMethod,
        date: new Date(),
        totalAmount: req.body.total,
        status: 'failed',
        products: cartItems?.products
    }




    req.session.payment = orderObject.paymentMethod;
    req.session.total = orderObject.totalAmount;
    req.session.orderDate = orderObject.date;



    let orderItems = new Orderdb(orderObject)


    // console.log('ddddddddddddddddddd', orderItems);

    // console.log('product quantity decreasing before.................');

    await Productdb.updateOne({ "_id": objectId(orderItems.products[0]?.id) },
        {
            $inc: { "quantity": -cartItems?.products[0]?.quantity }
        }
    )


    //for transfering the cart items products array to order success page......
    const productIds = await Cartdb.aggregate([
        {
            $match: { userId: objectId(userId) }
        },
        {
            $unwind: "$products"
        },
        {
            $project: {
                _id: 0,
                id: "$products.id"
            }
        }
    ])

    // console.log('productIds---------', productIds);

    const productIdsArray = [];
    for (i of productIds) {
        productIdsArray.push(i.id);
    }
    // console.log('productIdsArray---------', productIdsArray);

    req.session.products = productIdsArray;
    //..........................................................................

    await Cartdb.deleteOne({ userId: objectId(userId) })

    if (orderItems.paymentMethod === 'COD') {

        orderItems
            .save();
        res.json({ codSuccess: true })
    }
    else {

        console.log("orderItems ======", orderItems);
        const orderId = orderItems._id;
        const amount = orderItems.totalAmount;


        var options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: orderId.toString()
        }


        instance.orders.create(options, (err, order) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("New order========", order);

                orderItems
                    .save();

                // console.log('lllllllllllllkkkkkkkkkkkkk', orderObject);
                res.json({ order })
            }
        })

    }

}
// }



//checkout from buynow.........................................
exports.checkoutFromBuynow = async (req, res) => {
    // console.log("req.body//////////////", req.body);

    const userId = req.session.user._id;
    // console.log("userId-----", userId);

    const dirBuynowProduct = req.session.dirBuynowProduct;
    // console.log("dirBuynowProduct", dirBuynowProduct);

    let deliveryObj = {
        name: req.body.name,
        address: req.body.address,
        pincode: req.body.pincode,
        mobile: req.body.mobile
    }

    req.session.address = deliveryObj;

    // console.log(deliveryObj);



    const orderObject = {
        userId: userId,
        deliveryDetails: deliveryObj,
        paymentMethod: req.body.paymentMethod,
        date: new Date(),
        totalAmount: req.body.total,
        status: 'failed',
        products: [{ id: objectId(dirBuynowProduct._id), quantity: 1 }]
    }

    // console.log('cccccccccccccccccccccccc', orderObject.products);


    req.session.payment = orderObject.paymentMethod;
    req.session.total = orderObject.totalAmount;
    req.session.orderDate = orderObject.date;

    // console.log(req.session.orderDate);

    let orderItems = new Orderdb(orderObject)
    // console.log('cccccccccccccccccccccccc', orderItems);




    // console.log('product quantity decreasing before.................');

    await Productdb.updateOne({ "_id": objectId(orderItems.products[0]?.id) },
        {
            $inc: { "quantity": -1 }
        }
    )


    //for transfering the item array to order success page......
    const productIdsArray = dirBuynowProduct._id;
    // console.log('productIdsArray---------', productIds);

    req.session.products = productIdsArray;
    //..........................................................................

    if (orderItems.paymentMethod === 'COD') {

        orderItems
            .save();

        const order = await Orderdb.findOne(orderObject)
        console.log('order', order);

        res.json({ codSuccess: true })
    }
    else {

        console.log("orderItems ======", orderItems);
        const orderId = orderItems._id;
        const amount = orderItems.totalAmount;


        var options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: orderId.toString()
        }


        instance.orders.create(options, (err, order) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log("New order========", order);

                orderItems
                    .save();

                // console.log('lllllllllllllkkkkkkkkkkkkk', orderObject);
                res.json({ order })
            }
        })

    }

}


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

    // console.log('hellooooooooooooooo', orderItems);

    // const orderedProduct = orderItems[0]?.orderProducts;
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
    // console.log(status);
}

//payment of razorpay..............................................
exports.verifyPayment = async (req, res) => {

    const razPaymentId = req.body.payment.razorpay_payment_id;
    const razOrderId = req.body.payment.razorpay_order_id;
    const razSign = req.body.payment.razorpay_signature;

    // console.log('jjjjjjjjjj', razOrderId );

    const crypto = require('crypto');
    let hmac = crypto.createHmac('sha256', 'ycRd6fwBkLO7GmZGjm2REW9a');

    hmac.update(razOrderId + '|' + razPaymentId);
    hmac = hmac.digest('hex');
    if (hmac === razSign) {
        console.log('hmac verified');
    }
    else {
        console.log('hmac not verified');
    }

    console.log('hmac', hmac);
    console.log('payment successful');

    res.json({ status: true })

}

// order success page....................................................
exports.orderSuccess = async (req, res) => {

    // const userId = req.session.user._id;
    const address = req.session.address;
    // console.log('aaaaaaaaaaa', address);
    const payment = req.session.payment;

    const total = req.session.total;


    const productsIds = req.session.products;

    // req.session.products = null;

    // console.log('productsssssssss', productsIds);

    const products = await Productdb.find({
        _id: { $in: productsIds }
    })

    const p = await Orderdb.findOne({date: req.session.orderDate})
    // console.log('p]]]]]]]]]]]]]]]]]]]]]]]', p);

    const pro = await Orderdb.updateOne({date: req.session.orderDate},
        {
            $set: {
                status: 'dispatched'
            }
        })

    // console.log('proooooooooooooooo', pro);

    // console.log('get cart products through mongodb dollar in', products);
    res.render('user/order_success', { address, payment, total, products })
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
            $set: { status: 'cancelled' }
        })
    const order = await Orderdb.findOne({ _id: objectId(orderId) })

    // console.log("order)))))))))))", order);
    const proId = order.products[0].id;

    await Productdb.updateOne({ " _id": objectId(proId) },
        {
            $inc: { quantity: 1 }
        })
    res.redirect('/admin/admin-ordersList')

}

