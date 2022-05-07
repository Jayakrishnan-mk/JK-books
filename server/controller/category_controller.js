const Categorydb = require('../model/category_model');

//add category......................................
exports.addCategory = (req,res) => {

    if(!req.body) {
        res.status(400).send({message: "Content can not be empty !!"})
        return;
    }
    else{

        const category = new Categorydb({
            name: req.body.name
        })
    
        //save category in the database 
        category
        .save(category)
        .then(data => {
            res.redirect('/admin/admin-categories');
        })
        .catch(err => {
            res.render('admin/add_category', {category: "" , error: "Category already exist"})
        })
    
    }


}


//search categories..................
exports.categorySearch = (req, res) => {

    Categorydb.find({
        name: new RegExp(req.query.searchName, "i")
    })
        .then(data => {
            res.render('admin/admin_categories', { categories: data })
        })
}  
 
 //delete category......................................

exports.deleteCategory = (req, res) => {
    const id = req.params.id;
    console.log(id);
    Categorydb.findByIdAndDelete(id)
        .then(data => {
            res.redirect('/admin/admin-categories')
        })
}


 //update category......................................
exports.updateCategory = (req,res) => { 
    const id = req.params.id;
    console.log(id);
    Categorydb.findByIdAndUpdate(id, req.body, { UserFindAndModify: false })
        .then(data => {
            res.redirect('/admin/admin-categories')

        })

}

//admin categories......................................
exports.adminCategories =  async (req,res) => {
    const categories= await Categorydb.find()
    res.render('admin/admin_categories',{categories})
}

//add category...........................................
exports.addCategory =  (req,res) => {
    const categories = Categorydb.find()     
    res.render('admin/add_category',{categories})
}

//update category...........................................
exports.updateCategory =  async (req, res) => {

    console.log(req.query.id + "----------------------------query id");
    console.log(typeof (req.query.id));

    const category = await Categorydb.findOne({ _id: req.query.id })
    res.render('admin/update_category', { category })

    console.log('--------------------------------------------compiler');

}