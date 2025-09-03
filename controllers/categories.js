const Category = require('../models/category');
const { Products } = require('../models/product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const Kino = require('../models/kino');
const Season = require('../models/season');
const checkCategoryForRestricted = require('../utils/checkCategoryForRestricted');

exports.getCategories = asyncHandler(async(req, res, next) => {
    try {
        let categories = await Category.find();

        if (!req.allowedCountry) {
            categories = categories.filter(x => !x.isRestricted)
        }

        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch {
        return res.status(500).json({ status: false })
    }
});

// @description Create Category
// @route POST /api/category
// @access Private/(Admin or Publisher)
exports.createCategory = asyncHandler(async(req, res, next) => {

    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }

});

// @description Get single Category
// @route GET /api/category/:categoryId
// @access Private/(Admin or Publisher)
exports.getCategory = asyncHandler(async(req, res, next) => {
    try {
        let category = await Category.findById(req.params.categoryId);

        if (!req.allowedCountry && category && category.isRestricted) {
            category = null
        }

        if (!category)
            return next(new ErrorResponse(`Resourse not found with id of ${req.params.categoryId}`, 404))
        res.status(200).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }

});

// @description update Category
// @route PUT /api/category/:categoryId
// @access Private/Admin
exports.updateCategory = asyncHandler(async(req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.categoryId, req.body, {
            new: true,
            runValidators: true
        });
        if (!category)
            return next(new ErrorResponse(`Resourse not found with id of ${req.params.categoryId}`, 404))
        res.status(200).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }


});

// @description delete single Category
// @route DELETE /api/category
// @access Private/Admin
exports.deleteCategory = asyncHandler(async(req, res, next) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.categoryId);
        if (!category)
            return next(new ErrorResponse(`Resourse not found with id of ${req.params.categoryId}`, 404))
        await Products.deleteMany({ category: req.params.categoryId });
        res.status(200).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }

});


exports.getQuery = asyncHandler(async(req, res) => {

    try {
        try {
            let resultQuery;
            let type = req.query.type
            if (type == 'kino') {
                resultQuery = await Kino.find({ category: req.params.categoryId }).populate("category")
            }
            if (type == 'season') {
                resultQuery = await Season.find({ category: req.params.categoryId }).populate("category")
            }

            if (!req.allowedCountry) {
                resultQuery = resultQuery.filter(item => {
                    return checkCategoryForRestricted(item.category)
                })
            }

            res.status(200).json({
                success: true,
                count: resultQuery.length,
                data: resultQuery
            })

        } catch (error) {
            if ((type != 'kino') || type != 'season') {
                res.send(error)
            }
        }
    } catch {
        return res.status(500).json({ status: false })
    }


})