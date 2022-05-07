const Productdb = require('../model/product_model');
const Cartdb = require('../model/cart_model');
const objectId = require('mongoose').Types.ObjectId;


//add products..................
exports.addProducts = (req, res) => {
    console.log(req.body);
    //validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty !!" })
        return;
    }

    console.log(req.files?.image);

    let image = req.files?.image;
    if (image) {
        var imgPath = './public/product_images/' + Date.now() + '.jpg';
        image.mv(imgPath, (err) => {
            console.log(err);
        })
    }

    //new product
    const product = new Productdb({

        name: req.body.name,
        author: req.body.author,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: imgPath
    })


    //save product in the database
    product
        .save(product)
        .then(() => {
            let image = req.files?.image;
            if (image) {
                let imgPath = './public/product_images/' + Date.now() + '.jpg';
                image.mv(imgPath, (err) => {
                    console.log(err);
                })
            }

            res.redirect("/admin/admin-products")

        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while adding a product operation" })
        })

}

//update product......................................

exports.updateProduct = async (req, res) => {
    const id = req.params.id;
    let image = req.files?.image;
    if (image) {
        let imgPath = './public/product_images/' + Date.now() + '.jpg';
        image.mv(imgPath, (err) => {
            console.log(err);
        })
    }
    // await Productdb.findByIdAndUpdate(id, req.body, { UserFindAndModify: false })

    var imgPath = './public/product_images/' + Date.now() + '.jpg';

    const product = {

        name: req.body.name,
        author: req.body.author,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: imgPath
    }
    await Productdb.updateOne({ _id: id }, { $set: product })


    res.redirect('/admin/admin-products')

}


//delete product......................................

exports.deleteProduct = (req, res) => {
    const id = req.params.id;
    console.log(id);
    Productdb.findByIdAndDelete(id)
        .then(data => {
            res.redirect('/admin/admin-products')
        })
}

//search products..................
exports.productSearch = (req, res) => {

    Productdb.find({
        name: new RegExp(req.query.searchName, "i")
    })
        .then(data => {
            res.render('admin/admin_products', { products: data })
        })
}

//product products....................................
exports.productDetails = async (req, res) => {
    console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    const products = await Productdb.findById(req.query.id)
    console.log("products>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", products);

    // const count = cartCount[0].products.length;

    const count = null;
    if (req.session.user) {
        const cartCount = await Cartdb.find({ userId: objectId(req.session.user._id) })
        const count = cartCount[0]?.products?.length;
        res.render('user/user_productDetails', { products, count })
    }

    res.render('user/user_productDetails', { products, count })
}


//remove products....................................
exports.productRemove = async (req, res) => {
    const proId = req.params.id;
    console.log("proid--------", proId);
    const userId = req.session.user._id;
    await Cartdb.updateOne({ userId: objectId(userId) },

        {

            $pull: { products: { id: objectId(proId) } }

        })
    res.redirect('/cart');

}

//product quantity changing....................................
exports.changeProductQuantity = async (req, res) => {
    console.log("req.body----------", req.body);
    const cart = req.body.cart;
    const product = req.body.product;
    let count = req.body.count;
    let quantity = req.body.quantity;
    count = parseInt(count)
    quantity = parseInt(quantity)
    console.log("type of count ---", typeof (count));
    console.log("type of quantity ---", typeof (quantity));
    // console.log("quantity----------------",req.body.quantity);
    // console.log(count);  


    if (quantity == 1 && count == -1) {

        await Cartdb.updateOne({ _id: objectId(cart) },
            {
                $pull: { products: { id: objectId(product) } }
            })
        res.json({ status: true, removeProduct: true })
    }
    else {
        await Cartdb.updateOne({ cartId: objectId(cart), 'products.id': objectId(product) },
            {
                $inc: { "products.$.quantity": count }
            })
        res.json({ status: true })

    }
}

//order placing....................................
exports.placeOrder = async (req, res) => {
    const userId = req.session.user._id;
    console.log("userId-----", userId);
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
    console.log("cartItems----------------------------------------------------------------------", cartItems);
    let total = cartItems[0].total;
    console.log("total----------", total);



    res.render('user/place_order', { total })
}