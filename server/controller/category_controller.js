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
            res.redirect('/admin-categories');
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
            res.redirect('/admin-categories')
        })
}


 //update category......................................
exports.updateCategory = (req,res) => {
    const id = req.params.id;
    console.log(id);
    Categorydb.findByIdAndUpdate(id, req.body, { UserFindAndModify: false })
        .then(data => {
            res.redirect('/admin-categories')

        })

}