const Userdb = require('../model/model');
    
//create and save a user..................
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


//block unblock user..................
exports.block = async (req, res) => {
    try {
        console.log(req.params.id, "...................................................");
        const user = await Userdb.findOne({ _id: req.params.id })
        console.log("user.isBlocked", user.isBlocked);
        console.log("req.params.id", req.params.id);
        if (user.isBlocked) {
            await Userdb.updateOne({ _id: req.params.id }, { isBlocked: false })
            res.status(200).redirect('/admin-home')
        }
        else {
            await Userdb.updateOne({ _id: req.params.id }, { isBlocked: true })
            res.status(200).redirect('/admin-home')
        }
    }
    catch (error) {
        res.status(400).send(error)
    }

}

//search user..................
exports.userSearch = (req, res) => {

    Userdb.find({
        name: new RegExp(req.query.searchName, "i")
    })
        .then(data => {
            res.render('admin/admin_home', { users: data })
        })
}  

