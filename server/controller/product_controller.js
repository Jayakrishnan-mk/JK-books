const Productdb = require('../model/product_model');
const Cartdb = require('../model/cart_model');
const Categorydb = require('../model/category_model');
const SavedAddressdb = require('../model/savedAddress_model');
const objectId = require('mongoose').Types.ObjectId;
const Joi = require('joi');

//add products..................
exports.addProducts = async (req, res) => {

    let image = req.files?.image;
    if (image) {
        var imgPath = './public/product_images/' + Date.now() + '.jpg';
        var imagePath = '/public/product_images/' + Date.now() + '.jpg';
        image.mv(imgPath, (err) => { })
    }

    const productObject = {

        name: req.body.name,
        author: req.body.author,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: imagePath
    }

    const error = addValidate(productObject)

    //new product
    const product = new Productdb(productObject)

    if (error.error) {
        let errorMsg = error.error?.details[0].message;
        const category = await Categorydb.find({});
        res.render('admin/add_product', { category, errorMsg })
    }
    else {

        //save product in the database
        product
            .save(product)
            .then(() => {

                res.redirect("/admin/admin-products")

            })
            .catch(err => {
                res.status(500).send({ message: err.message || "Some error occured while adding a product operation" })
            })

    }
}

//update product put......................................
exports.updateProductPut = async (req, res) => {

    const id = req.params.id;

    let image = req.files?.image;
    if (image) {
        let imgPath = './public/product_images/' + Date.now() + '.jpg';
        var imagePath = '/public/product_images/' + Date.now() + '.jpg';
        image.mv(imgPath, (err) => { })
    }

    const product = {
        name: req.body.name,
        author: req.body.author,
        category: req.body.category,
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        image: imagePath
    }

    const error = editValidate(product);

    if (error.error) {

        let errorMsg = error.error?.details[0].message;

        const category = await Categorydb.find({});

        const pro = await Productdb.findById(id);

        res.render('admin/update_product', { product: pro, category, errorMsg })


    }
    else {
        await Productdb.updateOne({ _id: id }, { $set: product })
        res.redirect('/admin/admin-products')

    }
}

//update product get......................................
exports.updateProductGet = async (req, res) => {

    const id = req.params.id;

    const product = await Productdb.findById(id);

    const category = await Categorydb.find();

    res.render('admin/update_product', { product, category, errorMsg: "" })
}

//delete product......................................

exports.deleteProduct = (req, res) => {

    const id = req.params.id;

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

    const products = await Productdb.findById(req.query.id);

    const count = null;
    if (req.session.user) {
        const cartCount = await Cartdb.find({ userId: objectId(req.session.user._id) })
        const count = cartCount[0]?.products?.length;

        res.render('user/user_productDetails', { products, count, isUserlogin: req.session.isUserlogin })
    }

    res.render('user/user_productDetails', { products, count, isUserlogin: req.session.isUserlogin })
}


//remove products....................................
exports.productRemove = async (req, res) => {

    const proId = req.body.product;
    const userId = req.session.user._id;
    await Cartdb.updateOne({ userId: objectId(userId) },
        {
            $pull: { products: { id: objectId(proId) } }

        })

    res.json({ status: true })

}

//product quantity changing....................................
exports.changeProductQuantity = async (req, res) => {

    const cart = req.body.cart;
    const product = req.body.product;

    let count = req.body.count;
    let quantity = req.body.quantity;

    count = parseInt(count)
    quantity = parseInt(quantity)

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

    let total = cartItems[0]?.total;

    const saved = await SavedAddressdb.find({ userId: objectId(userId) }).sort({ date: -1 }).limit(3);

    res.render('user/place_order', { total, saved, user: req.session.user, error: "" })
}


//place order direct from home page and product details page. buy now button.....
exports.placeOrderDirect = async (req, res) => {

    const proId = req.query.id;

    const userId = req.session.user?._id;

    const product = await Productdb.findById(proId);

    const total = product.price;

    req.session.dirBuynowProduct = product;

    const saved = await SavedAddressdb.find({ userId: objectId(userId) }).sort({ date: -1 }).limit(3);


    res.render('user/placeOrderFromHome', { saved, total, user: req.session.user, error: "" })

}


//validation for adding a new product....................................
const addValidate = (data) => {

    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required().label("Name"),
        author: Joi.string().min(3).max(30).required().label("Author"),
        category: Joi.string().min(3).max(20).required().label("Category"),
        price: Joi.number().required().label("Price"),
        quantity: Joi.number().required().label("Quantity"),
        description: Joi.string().min(10).max(1000).required().label("Description"),
        image: Joi.string().required().label("Image")
    })

    return schema.validate(data)
}

//validation for update a new product....................................
const editValidate = (data) => {

    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required().label("Name"),
        author: Joi.string().min(3).max(30).required().label("Author"),
        category: Joi.string().min(3).max(20).required().label("Category"),
        price: Joi.number().required().label("Price"),
        quantity: Joi.number().required().label("Quantity"),
        description: Joi.string().min(10).max(1000).required().label("Description"),
        image: Joi.allow()
    })

    return schema.validate(data)
}

