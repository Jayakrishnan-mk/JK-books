const express = require('express');
const router = express.Router();

const controller = require('../controller/controller');
const product_controller = require('../controller/product_controller');
const category_controller = require('../controller/category_controller');
const order_controller = require('../controller/order_controller');

const admin = require('../model/admin_model');
const Categorydb = require('../model/category_model');




//admin check .........................
router.get('/', (req, res) => {
    if (req.session.isAdminlogin) {
        // console.log('isAdminlogin');
        res.redirect('admin/admin-home')
    } else {
        // console.log('no admin login');
        res.render('admin/admin_login');
    }
})

//admin home post.........................
router.post('/admin-home', async (req, res) => {
    // console.log(req.body);
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
router.use((req, res, next) => {
    if (!req.session.isAdminlogin) {
        res.redirect('/admin')
    }
    else {
        next();
    }
})

// ajax query deleting not supporting time (method overriding not possible time) i sent that in query............................
router.use((req, res, next) => {
    if (req.query._method == "DELETE") {
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
    // console.log(req.session.isAdminlogin);
    req.session.isAdminlogin = false;
    res.redirect('/')
})





//add products.................................. 
router.get('/add-product', async (req, res) => {
    const category = await Categorydb.find({});
    res.render('admin/add_product', { category , errorMsg: ""})
})

//new category adding time category already exist...................................
router.get('/add-new-category', (req, res) => {
    res.render('admin/add_category', { category: "", error: "Category already exist" })
})


//admin products list.................................. 
router.get('/admin-products', controller.adminProducts);

//update product.................................. 
router.get('/update-product/:id', product_controller.updateProductGet)

//categories.................................. 
router.get('/admin-categories', category_controller.adminCategories);

//add category.................................. 
router.get('/add-category', category_controller.addCategoryGet);

//update category.................................. 
router.get('/update-category/:id', category_controller.updateCategoryGet);

//delete category.................................. 
router.delete('/delete-category/:id', category_controller.deleteCategory);

//upddate category...................................
router.put('/update-category/:id', category_controller.updateCategoryPut);

//category adding.................................. 
router.post('/adding-category', category_controller.addCategoryPost);

//delete product.................................. 
router.delete('/delete-product/:id', product_controller.deleteProduct);

//update product.................................. 
router.put('/update-product/:id', product_controller.updateProductPut);

//cancel order..................................
router.get('/cancelling-order/:id', order_controller.cancelOrderInAdminside); 

// delivery status in dropdown
router.post('/deliveryStatus', order_controller.deliveryStatus);

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

//orders page in admin..................................
router.get('/admin-ordersList', controller.adminOrdersList)


module.exports = router;  