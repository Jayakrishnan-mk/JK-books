const Productdb = require('../model/product_model');

// //add products..................
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

            res.redirect("/admin-products")

        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while adding a product operation" })
        })

}

//delete product......................................

exports.deleteProduct = (req, res) => {
    const id = req.params.id;
    console.log(id);
    Productdb.findByIdAndDelete(id)
        .then(data => {
            res.redirect('/admin-products')
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
    await Productdb.updateOne({_id: id}, {$set: product})
    

    res.redirect('/admin-products')

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
 
 
