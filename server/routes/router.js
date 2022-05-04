const express = require('express');
const router = express.Router();

const controller = require('../controller/controller');
const product_controller = require('../controller/product_controller');
const category_controller = require('../controller/category_controller');

const admin = require('../model/admin_model');
const Userdb = require('../model/model');
const Productdb = require('../model/product_model');
const Categorydb = require('../model/category_model');


//invalid url......................


//admin check .........................
router.get('/', (req, res) => {
    if (req.session.isAdminlogin) {
        console.log('isAdminlogin');
        res.redirect('admin/admin-home')
    } else {
        console.log('no admin login');
        res.render('admin/admin_login');
    }
})

//admin home post.........................
router.post('/admin-home',async (req, res) => {
    console.log(req.body);
    const Admin = await admin.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if (Admin) {
          
    req.session.admin = req.body.email;
        req.session.isAdminlogin = true;
        // console.log(req.session.isAdminlogin);

        res.redirect('/admin/admin-home')

    }
    else {
        res.render('admin/admin_login', { error: "Incorrect Entry" })
    }

})

//middleware for route protect..................
router.use((req,res,next) => {
    if(!req.session.isAdminlogin){
        res.redirect('/admin')

    }
    else{
        next();
    }
})

//for delete ............................
router.use((req,res,next) => {
    if(req.query._method == "DELETE"){
        req.method = "DELETE";
        req.url = req.path
    }
    next();
})


//admin home get.................................. 
router.get('/admin-home', (req, res) => {
    console.log(req.session.isAdminlogin);
    if(req.session.isAdminlogin){
        Userdb.find()
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
    }
    else{
        res.redirect('/admin')
    }
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
    console.log(req.session.isAdminlogin);
    req.session.isAdminlogin = false;
    res.redirect('/')
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

//categories.................................. 
router.get('/admin-categories', async (req,res) => {
    const categories= await Categorydb.find()
    res.render('admin/admin_categories',{categories})
})

//add category.................................. 
router.get('/add-category', (req,res) => {
    const categories = Categorydb.find()     
    res.render('admin/add_category',{categories})
})
 
//update category.................................. 
router.get('/update-category/:id', async (req, res) => {

    console.log(req.query.id + "----------------------------query id");
    console.log(typeof (req.query.id));

    const category = await Categorydb.findOne({ _id: req.query.id })
    res.render('admin/update_category', { category })

    console.log('--------------------------------------------compiler');

});
 

//delete category.................................. 
router.delete('/delete-category/:id', category_controller.deleteCategory);

//upddate category...................................
router.put('/update-category/:id', category_controller.updateCategory);


//category adding.................................. 
router.post('/adding-category', category_controller.addCategory)

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

//search categories.................................. 
router.get('/category-search', category_controller.categorySearch)

//admin user blocking.................................. 
router.patch('/status/:id', controller.block)

//create user................................. 
router.post('/create-user', controller.create)


module.exports = router;  