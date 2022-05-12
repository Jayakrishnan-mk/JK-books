const Orderdb = require('../model/order_model');
const Cartdb = require('../model/cart_model');
const Productdb = require('../model/product_model');
const Userdb = require('../model/model');
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

    console.log("cartItems product----->>>>", cartItems?.products[0]);

    console.log("req.body======", req.body);

    // console.log('ordered items....... available');

    let orderItems = new Orderdb({
        userId: objectId(userId),
        deliveryDetails: {
            name: req.body.name,
            address: req.body.address,
            pincode: req.body.pincode,
            mobile: req.body.mobile
        },
        paymentMethod: req.body.paymentMethod,
        date: new Date(),
        totalAmount: req.body.total,
        status: 'dispatched',
        products: cartItems?.products[0]
    })
    orderItems
        .save()
        // await Productdb.updateMany({})

    await Cartdb.deleteMany({ userId: objectId(userId) })

    if (orderItems.paymentMethod === 'COD') {

        // console.log("orderItems ======", orderItems);

        res.json({codSuccess : true})

        res.render('user/order_success')
    }
    else {
        // console.log("orderItems ======", orderItems);
        const orderId = orderItems._id;
        

        var options = {
            amount: orderItems.totalAmount,
            currency: 'INR', 
            receipt: orderId.toString()
        }
        
        // console.log("options....", options);

        instance.orders.create(options, (err,order) => {
            if (err) {
                console.log("err;;;;", err);
            }
            else {
            console.log("New order========", order);
            res.json({ order })   
            } 
        })  
    }
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

    const orderedProduct =  orderItems[0].orderProducts[0];
    console.log("ord-----", orderedProduct);

    res.render('user/my_orders', { orderItems  })
}

//payment of razorpay..............................................
exports.verifyPayment = async (req, res) => {
    console.log(req.body);
}