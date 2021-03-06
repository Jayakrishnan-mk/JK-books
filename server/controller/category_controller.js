const Categorydb = require('../model/category_model');
const Productdb = require('../model/product_model');
const objectId = require('mongoose').Types.ObjectId;


//add category......................................
exports.addCategoryPost = async (req, res) => {

    const already = await Categorydb.findOne({ name: req.body.name })

    if (!req.body.name) {
        req.session.error = "Please fill the input field."
        res.redirect('/admin/admin-categories-validate')
    }
    else if (already) {
        req.session.error = "Category already exist"
        res.redirect('/admin/admin-categories-validate')
    }
    else if (req.body.name.length < 3) {
        req.session.error = "Category length is too short."
        res.redirect('/admin/admin-categories-validate')
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

//category validation of admin...........
exports.adminCategoriesValidate = async (req, res) => {

    res.render('admin/add_category', { error: req.session.error })
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

    await Productdb.deleteMany({ category: category.name })
    await Categorydb.findByIdAndDelete(id)

    res.redirect('/admin/admin-categories')
}


//  update category......................................
exports.updateCategoryPut = (req, res) => {

    const id = req.params.id;

    Categorydb.findByIdAndUpdate(id, req.body, { UserFindAndModify: false })
        .then(data => {
            res.redirect('/admin/admin-categories')
        })
}

// update category...........................................
exports.updateCategoryGet = async (req, res) => {

    const categoryId = req.params.id;

    const category = await Categorydb.findOne({ _id: objectId(categoryId) })

    res.render('admin/update_category', { category })

}

//admin categories......................................
exports.adminCategories = async (req, res) => {

    const categories = await Categorydb.find()
    res.render('admin/admin_categories', { categories })
}

//add category...........................................
exports.addCategoryGet = (req, res) => {

    const categories = Categorydb.find()
    res.render('admin/add_category', { categories, error: "" });
}

