const Cartdb = require('../model/cart_model');
const Productdb = require('../model/product_model');

const objectId = require('mongoose').Types.ObjectId;





//add to cart.......................................................
exports.addToCart = async (req, res) => {
    const userId = req.session.user._id;
    console.log('userid printed...................................', userId);
    const proId = req.params.id;
    console.log("productid printed.................................", proId);
    console.log(req.body);
    const product = {
        id: objectId(proId),
        quantity: 1
    }

    const userCart = await Cartdb.findOne({ user: objectId(userId) })

    if (userCart) {
        let proExist = userCart.products.findIndex(product => product.id == proId)
        // console.log("proExist-------------", proExist);
        if (proExist != -1) {
            // console.log(objectId(proId));
            await Cartdb.updateOne({ userId: objectId(userId), 'products.id': objectId(proId) },
                {
                    $inc: { "products.$.quantity": 1 }
                })
            res.json({ status: true }) 
        }

        else {
            const cart = await Cartdb.updateOne({ userId: objectId(userId) },
                {
                    $push: { products: product }
                })
            res.json({ status: true })

        }
    }

    else {
        // console.log("else part");
        const cart = new Cartdb({
            userId: objectId(userId),
            products: [product]
        })
        await cart.save()
        // console.log('cart saved...................................');
        res.json({ status: true })
    }
}

//cart page..........................................................
exports.cart = async (req, res) => {

    const userId = req.session.user?._id;
    // console.log("userId-----", userId);
    let cartItems = await Cartdb.aggregate([
        {
            $match: { userId: objectId(userId) }

        },
        {
            $unwind: "$products"
        },
        {
            $project: {
                id: "$products.id",
                quantity: "$products.quantity"
            }

        },
        {
            $lookup: {
                from: "productdbs",
                localField: "id",
                foreignField: '_id',
                as: 'product'
            }
        }

    ])

    let totalAmt = await Cartdb.aggregate([
        {
            $match: { userId: objectId(userId) }

        },
        {
            $unwind: "$products"
        },
        {
            $project: {
                id: "$products.id",
                quantity: "$products.quantity"
            }

        },
        {
            $lookup: {
                from: "productdbs",
                localField: "id",
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $project: {
                _id: 1,
                quantity: 1,
                product: { $arrayElemAt: ["$product", 0] }

            },

        },
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ["$quantity", "$product.price"] } }

            }
        }
    ])

    
    
    const pros = await Cartdb.find({ id: objectId(userId) })
    // console.log("pros>>>>>>>>>>>>>>>>>>", pros[0]);
    // console.log("cartItems>>>>>>>>>>>==============", cartItems[0]); 
    
    
    let totalAmount = totalAmt[0]?.total;
    // console.log("totalamount----->----------", totalAmt);


   

    res.render('user/cart', { products: cartItems, pros: pros[0], totalAmount })

}