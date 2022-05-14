const Userdb = require('../model/model');
const Productdb = require('../model/product_model');
const Orderdb = require('../model/order_model');

const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const objectId = require('mongoose').Types.ObjectId;

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Admin   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


//admin home page..........................................
exports.adminHomeGet = (req, res) => {
    // console.log(req.session.isAdminlogin);
    if (req.session.isAdminlogin) {
        Userdb.find()
            .then(data => {
                res.render('admin/admin_home', { users: data })
            })
    }
    else {
        res.redirect('/admin')
    }
}

//users list.................................................
exports.allUsers = (req, res) => {
    Userdb.find()
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
}

//admin products list........................................
exports.adminProducts = async (req, res) => {
    try {
        const products = await Productdb.find() 
        // console.log(products);
        console.log(products[0].image);
        res.render('admin/admin_products', { products: products })
    }
    catch (error) {
        res.status(403).send({ message: error })
    }
}

//update product page........................................
exports.updateProduct = async (req, res) => {

    // console.log(req.query.id + "----------------------------query id");
    // console.log(typeof (req.query.id));

    const product = await Productdb.findOne({ _id: req.query.id })
    res.render('admin/update_product', { product })

    // console.log('--------------------------------------------compiler');

}



//create and save a user........................................
exports.create = (req, res) => {
    //validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty!!" });
        return;
    }
    else {

        //new user
        const user = new Userdb({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            number: req.body.number,
            gender: req.body.gender,
            status: req.body.status
        })


        //save user in db
        user
            .save(user)
            .then(data => {
                // console.log(data);

                res.render('admin/add_user', { user: "New User added successfully.", error: "" })
            })
            .catch(err => {
                res.render('admin/add_user', { user: "", error: "User already exist" })
            })
    }
}


//admin block unblock user......................................
exports.block = async (req, res) => {
    try {
        // console.log(req.params.id, "...................................................");
        const user = await Userdb.findOne({ _id: req.params.id })
        // console.log("user.isBlocked", user.isBlocked);
        // console.log("req.params.id", req.params.id);
        if (user.isBlocked) {
            await Userdb.updateOne({ _id: req.params.id }, { isBlocked: false })
            res.status(200).redirect('/admin/admin-home')
        }
        else {
            await Userdb.updateOne({ _id: req.params.id }, { isBlocked: true })
            res.status(200).redirect('/admin/admin-home')
        }
    }
    catch (error) {
        res.status(400).send(error)
    }

}

//admin search user..................
exports.userSearch = (req, res) => {

    Userdb.find({
        name: new RegExp(req.query.searchName, "i")
    })
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
}




//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  User   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//user signup page..................
exports.userSignup = (req, res) => {
    // console.log(req.body);
    //validate request


    //new user
    const userObj = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        number: req.body.number,
        gender: req.body.gender
    }
    const user = new Userdb(userObj)
    const error = validate(userObj);
    if(error){ 
        // res.redirect('/user-signup-validation')
        res.render('user/user_signup', { error: error.error.details[0].message })

    }

    user
        .save(user)
        .then(() => {
            res.redirect('/user-login')
        })
        .catch(error => {
            // res.send({ message: error }) 
            console.log("error----", error);
        })
}

//user home page..................
exports.userHomeGet = async (req, res) => {

    if( req.session.isUserlogin){
        res.redirect('/')
    }else{
    

    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if (user) {
        req.session.user = user;
        req.session.isUserlogin = true;

        const products = await Productdb.find()
        // console.log(products);
        res.status(200).render('user/user_home', { products })

    }
    else {
        res.redirect('/')
    }
}
}

//user home page............................
exports.userHomePost = async (req, res) => {

    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    
    if (user) {
        req.session.user = user;
        req.session.isUserlogin = true;
        res.status(200).redirect('/')

    }
    else {
        res.redirect('/user-login-error')
    }
}

exports.adminOrdersList = async (req, res) => {

    const orderItems = await Orderdb.aggregate([

        {
            $lookup: {
                from: "productdbs",
                localField: "products.id",
                foreignField: '_id',
                as: 'orderProducts'
            }

        },
        {
            $lookup: {
                from: "userdbs",
                localField: "userId",
                foreignField: '_id',
                as: 'userDetails'
            }
        }

    ])

    // const orderedProduct =  orderItems[0].orderProducts[0];
    console.log("ord-----", orderItems);

    // console.log("order-----", orderItems[0].userDetails[0]);

    res.render('admin/admin_orders', { orderItems })
}

const validate = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(3).label("Name").required(),
        email: Joi.string().email().label("Email").required(),
        password: passwordComplexity().label("Password").required(),
        number: Joi.string().min(10).max(13).pattern(/^[0-9]+$/).label("Number").required(),
        gender: Joi.allow()

    })
    return schema.validate(data)
}