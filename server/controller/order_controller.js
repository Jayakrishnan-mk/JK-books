const Orderdb = require('../model/order_model');
const Cartdb = require('../model/cart_model');
const Productdb = require('../model/product_model');
const Userdb = require('../model/model');

const objectId = require('mongoose').Types.ObjectId;

var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

instance.orders.create({
  amount: 50000,
  currency: "INR",
  receipt: "receipt#1",
  notes: {
    key1: "value3",
    key2: "value2"
  }
})

//checkout page....................................
exports.checkout = async (req, res) => {
    const userId = req.session.user._id;
    // console.log("userId-----", userId);
    const cartItems = await Cartdb.findOne({
        userId: objectId(userId)


    })
    // console.log("cartItems-----", cartItems);

    // console.log("cartItems product----->>>>", cartItems.products[0].id);
    // console.log("req.body.total======", req.body.total);


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
        products: cartItems.products
    })
    orderItems
        .save()
        await Productdb.updateMany({ })

    await Cartdb.deleteMany({ userId: objectId(userId) })

    if (orderItems.paymentMethod == 'COD') {

        // console.log("orderItems orderId======", orderItems._id);

        // res.json({status : true})

        res.render('user/order_success')
    }
    else {
        console.log('online payment');
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

