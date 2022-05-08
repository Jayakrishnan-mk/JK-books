const Userdb = require('../model/model');
const Productdb = require('../model/product_model');


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>  Admin   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


//admin home page..........................................
exports.adminHomeGet =  (req, res) => {
    // console.log(req.session.isAdminlogin);
    if(req.session.isAdminlogin){
        Userdb.find()
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
    }
    else{
        res.redirect('/admin')
    }
}

//users list.................................................
exports.allUsers =  (req, res) => {
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
        res.render('admin/admin_products', { products : products})
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
exports.userSignup =  (req, res) => {
    // console.log(req.body);
    //validate request
    if (!req.body) {
        res.status(400).send({ message: "Content can not be empty" });
        return;
    }

    //new user
    const user = new Userdb({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        number: req.body.number,
        gender: req.body.gender
    })

    user
        .save(user)
        .then(data => {
            res.redirect('/user-login')
        })
        .catch(error => {
            res.send({ message: error })
        })
}

//user home page..................
exports.userHomeGet = async (req, res) => {

    const user = await Userdb.findOne({
        email: req.body.email,
        password: req.body.password
    })
    if (user) {
        req.session.user = req.body.email;
        req.session.isUserlogin = true;

        const products = await Productdb.find()
        // console.log(products);
        res.status(200).render('user/user_home', { products })

    }
    else {
        res.redirect('/')
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
        res.status(403).redirect('/user-login')
    }
}