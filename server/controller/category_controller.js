const Categorydb = require('../model/category_model');
const objectId = require('mongoose').Types.ObjectId;

const Joi = require('joi');
const Productdb = require('../model/product_model');
//add category......................................
exports.addCategoryPost = (req, res) => {
    if (!req.body.name) {
        
    }
    else {
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
                res.redirect('/admin/add-new-category');
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

exports.deleteCategory = async (req, res) => {
    const id = req.params.id;
    // console.log(id);

    const category = await Categorydb.findById(id)
    console.log(category.name);
    await Productdb.deleteMany({ category: category.name })
    await Categorydb.findByIdAndDelete(id)

            res.redirect('/admin/admin-categories')
}


//  update category......................................
exports.updateCategoryPut = (req, res) => {
    const id = req.params.id;
    // console.log(id);
    Categorydb.findByIdAndUpdate(id, req.body, { UserFindAndModify: false })
        .then(data => {
            res.redirect('/admin/admin-categories')

        })

}

// update category...........................................
exports.updateCategoryGet = async (req, res) => {

    const categoryId = req.params.id;
    // cat = parseInt(categoryId);

    // console.log(categoryId , "----------------------------categoryId");
    // console.log(typeof (categoryId));


    const category = await Categorydb.findOne({ _id: objectId(categoryId) })
    res.render('admin/update_category', { category })

    // console.log('--------------------------------------------compiler');

}

//admin categories......................................
exports.adminCategories = async (req, res) => {
    const categories = await Categorydb.find()
    res.render('admin/admin_categories', { categories })
}

//add category...........................................
exports.addCategoryGet = (req, res) => {
    const categories = Categorydb.find()
    res.render('admin/add_category', { categories });
}

