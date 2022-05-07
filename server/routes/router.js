const express = require('express');
const router = express.Router();

const controller = require('../controller/controller');
const product_controller = require('../controller/product_controller');
const category_controller = require('../controller/category_controller');

const admin = require('../model/admin_model');
const Userdb = require('../model/model');
const Productdb = require('../model/product_model');
const Categorydb = require('../model/category_model');




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
router.get('/admin-home', controller.adminHomeGet);

//add user.................................
router.get('/add-user', (req, res) => {
    res.render('admin/add_user', { user: "", error: "" })
})

//users list..................................
router.get('/users-list', controller.allUsers);

//admin logout.................................. 
router.get('/admin-logout', (req, res) => {
    console.log(req.session.isAdminlogin);
    req.session.isAdminlogin = false;
    res.redirect('/')
})



//admin products list.................................. 
router.get('/admin-products', controller.adminProducts);


//add products.................................. 
router.get('/add-product', async (req, res) => {
    res.render('admin/add_product')
})

//update product.................................. 
router.get('/update-product/:id', product_controller.updateProduct)

//categories.................................. 
router.get('/admin-categories', category_controller.adminCategories);

//add category.................................. 
router.get('/add-category', category_controller.addCategory);
 
//update category.................................. 
router.get('/update-category/:id', category_controller.updateCategory);

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