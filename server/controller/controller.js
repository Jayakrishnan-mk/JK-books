const bcrypt = require('bcrypt');
const Userdb = require('../model/model');
const Productdb = require('../model/product_model');
const Orderdb = require('../model/order_model');
const BookRequestdb = require('../model/bookReq_model');
const Categorydb = require('../model/category_model');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Admin   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


//admin home page..........................................
exports.adminHomeGet = (req, res) => {

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

        res.render('admin/admin_products', { products: products })
    }
    catch (error) {
        res.status(403).send({ message: error })
    }
}

//update product page........................................
exports.updateProduct = async (req, res) => {

    const product = await Productdb.findOne({ _id: req.query.id })
    res.render('admin/update_product', { product })

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
        const user = await Userdb.findOne({ _id: req.params.id })

        if (user.isBlocked) {
            await Userdb.updateOne({ _id: req.params.id }, { isBlocked: false })
            setTimeout(() => {
                res.status(200).redirect('/admin/admin-home')

            }, 1000);
        }
        else {
            await Userdb.updateOne({ _id: req.params.id }, { isBlocked: true })
            setTimeout(() => {
                res.status(200).redirect('/admin/admin-home')
            }, 1000);
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



//admin dashboard........................................
exports.adminDashboard = async (req, res) => {

    try {
        const user = await Userdb.find()
        const users = user.length;

        const product = await Productdb.find()
        const products = product.length;

        const order = await Orderdb.find()
        const orders = order.length;

        const total = await Orderdb.aggregate([
            {
                $project: {
                    totalAmount: 1,
                    _id: 0
                }
            }
        ])

        let totalAmount = 0;
        for (i of total) {
            totalAmount = totalAmount + i.totalAmount;
        }

        let totalSales = parseInt(totalAmount);

        //]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
        const payment = await Orderdb.aggregate([
            {
                $project: {
                    paymentMethod: 1,
                    _id: 0
                }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 }
                }
            }
        ])
        //]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
        const categories = await Categorydb.find()

        const array = [];

        for (i of categories) {
            // console.log(i.name);
            array.push(i.name)
        }

        // console.log(array);
        //]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
        const userBlocked = await Userdb.aggregate([
            {
                $project: {
                    isBlocked: 1,
                    _id: 0
                }
            },
            {
                $group: {
                    _id: "$isBlocked",
                    count: { $sum: 1 }
                }
            }

        ])

        for (i = 0; i < 2; i++) {
            if (userBlocked[i]._id == true) {
                userBlocked[i]._id = "Blocked"
            }
            else {
                userBlocked[i]._id = "Unblocked"
            }
        }
        //..................................................................


        res.render('admin/dashboard', { users, products, orders, total: totalSales, paymentMods: payment, userBl: userBlocked, array })
    }
    catch (error) {
        console.log(error);
    }

}

//admin orders list........................................
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

    res.render('admin/admin_orders', { orders: orderItems })
}

//users book requests list........................................
exports.requestList = async (req, res) => {

    const request = await BookRequestdb.find();

    res.render('admin/book_requests', { request })
}


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  User   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

//user signup page..................
exports.userSignup = async (req, res) => {

    //new user
    const userObj = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        number: req.body.number,
        gender: req.body.gender
    }

    userObj.password = await bcrypt.hash(userObj.password, 10)

    const alreadyEmail = await Userdb.findOne({ email: (userObj.email) })
    const alreadyNum = await Userdb.findOne({ number: (userObj.number) })

    if (alreadyEmail || alreadyNum) {
        req.session.body = req.body;
        req.session.error = "User already exist";
        res.redirect('/signup-error')

    }

    const user = new Userdb(userObj)
    const error = validate(userObj);
    if (error.error) {
        req.session.body = req.body;
        req.session.error = error.error.details[0].message;
        res.status(200).redirect('/signup-error')

    }

    user
        .save(user)
        .then(() => {
            res.redirect('/user-login')
        })
        .catch(error => {
            console.log("error----", error);
        })
}

//user signup error page..................
exports.signupError = async (req, res) => {

    const error = req.session.error;
    req.session.error = null;
    res.render('user/user_signupError', { error, body: req.body });
}

//user home page............................
exports.userHomePost = async (req, res) => {

    const user = await Userdb.findOne({
        email: req.body.email
    })

    if (user) {
        req.session.user = user;
        if (user.isBlocked == true) {
            req.session.error = "Your account is blocked";
            res.redirect('/user-login')
        }
        else {
            if (await bcrypt.compare(req.body.password, user.password)) {
                req.session.isUserlogin = true;
                res.status(200).redirect('/')

            }
            else {
                req.session.error = "Invalid Password";
                res.redirect('/user-login')
            }
        }
    }
    else {
        req.session.error = "Invalid Email";
        res.redirect('/user-login')
    }
}

// user profile........................................
exports.myProfile = async (req, res) => {

    const userId = req.session.user._id;
    const user = await Userdb.findByIdAndUpdate(userId, {
        name: req.body.name,
        email: req.body.email,
        number: req.body.number,
    })
    res.render('user/my_profile', { user });
}

//user profile edit..................................
exports.profileEdit = async (req, res) => {

    const user = req.session.user._id;

    await Userdb.updateOne({ _id: user }, {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        number: req.body.number,
    })

    res.redirect('/my-profile')

}

//book request page...............................
exports.bookRequest = async (req, res) => {

    res.render('user/book_request');
}

//book request post..................................
exports.bookRequestPost = async (req, res) => {

    const bookReq = {
        bookDetails: req.body.bookDetails,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone
    }

    const bookRequest = new BookRequestdb(bookReq);
    
    await bookRequest.save();

        res.json({ success: true });
    
}

//book status checking..................................
exports.bookStatus = async (req, res) => {

    const reqId = req.params.id;

    await BookRequestdb.findByIdAndDelete(reqId)
  

    setTimeout(() => {

        res.redirect('/admin/requestList');
    }, 1000);

}



//validations...........................

const validate = (data) => {

    const schema = Joi.object({
        name: Joi.string().pattern(/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/).min(3).label("Name").required(),
        email: Joi.string().email().label("Email").required(),
        password: new passwordComplexity({ min: 8, max: 100, lowerCase: 1, upperCase: 1, numeric: 1 }).required().label("Password"),
        number: Joi.string().min(10).max(13).pattern(/^[0-9]+$/).label("Number").required(),
        gender: Joi.allow()

    })

    return schema.validate(data)
}


