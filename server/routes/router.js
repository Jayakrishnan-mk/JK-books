const express = require('express');
const router = express.Router();

const controller = require('../controller/controller');
const product_controller = require('../controller/product_controller');

const Userdb = require('../model/model');
const Productdb = require('../model/product_model');

const credential = {
    email: 'admin@gmail.com',
    password: 'admin123'
}

//invalid url......................


//admin check .........................
router.get('/admin', (req, res) => {
    if (req.session.isAdminlogin) {
        console.log('isAdminlogin'); 
        res.redirect('/admin-home')
    } else {
        console.log('no admin login');
        res.render('admin/admin_login');
    }
})

//admin home post.........................
router.post('/admin-home', (req, res) => {
    if (req.body.email === credential.email && req.body.password == credential.password) {
        req.session.admin = req.body.email;
        req.session.isAdminlogin = true;

        res.redirect('/admin-home')

    }
    else {
        res.render('admin/admin_login', { error: "Incorrect Entry" })
    }

})


//admin home get.................................. 
router.get('/admin-home', (req, res) => {

    Userdb.find()
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
})

//add user.................................
router.get('/add-user', (req, res) => {
    res.render('admin/add_user', { user: "", error: "" })
})

//all users..................................
router.get('/users-list', (req, res) => {
    Userdb.find()
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
})

//admin logout.................................. 
router.get('/admin-logout', (req, res) => {
    req.session.destroy((err) => {
        res.clearCookie();
        if (err) {
            res.status(403).send('Hey Admin, Error while Logging out!')
        }
        else {
            res.status(200).render('admin/admin_login', { logout: "Logout Successfully." })
        }
    })
})



//admin products.................................. 
router.get('/admin-products', async (req, res) => {
    try {
        const products = await Productdb.find()
        console.log(products);
        res.render('admin/admin_products', { products })
    }
    catch (error) {
        res.status(403).send({ message: error })
    }
})


//add products.................................. 
router.get('/add-product', async (req, res) => {
    res.render('admin/add_product')
})

//update product.................................. 
router.get('/update-product/:id', async (req, res) => {

    console.log(req.query.id + "----------------------------query id");
    console.log(typeof (req.query.id));

    const product = await Productdb.findOne({ _id: req.query.id })
    res.render('admin/update_product', { product })

    console.log('--------------------------------------------compiler');

});


//delete product.................................. 
router.delete('/delete-product/:id', product_controller.deleteProduct);


//update product.................................. 
router.put('/update-product/:id', product_controller.updateProduct);


//add product.................................. 
router.post('/admin-products', product_controller.addProducts);

//search user.................................. 
router.get('/user-search', controller.userSearch)

//search products.................................. 
router.get('/product-search', product_controller.productSearch)

//admin user blocking.................................. 
router.patch('/status/:id', controller.block)

//create user................................. 
router.post('/create-user', controller.create)


module.exports = router;  