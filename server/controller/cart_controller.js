const Cartdb = require('../model/cart_model');
const objectId = require('mongoose').Types.ObjectId;

//add to cart.......................................................
exports.addToCart = async (req, res) => {

    const userId = req.session.user._id;
    const proId = req.params.id;

    const product = {
        id: objectId(proId),
        quantity: 1
    }

    const userCart = await Cartdb.findOne({ user: objectId(userId) })

    if (userCart) {
        let proExist = userCart.products.findIndex(product => product.id == proId)

        if (proExist != -1) {
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
        const cart = new Cartdb({
            userId: objectId(userId),
            products: [product]
        })

        await cart.save()

        res.json({ status: true })
    }
}

//cart page..........................................................
exports.cart = async (req, res) => {

    const userId = req.session.user?._id;

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

    let totalAmount = totalAmt[0]?.total;

    res.render('user/cart', { products: cartItems, pros: pros[0], totalAmount })

}