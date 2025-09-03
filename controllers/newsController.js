const News = require("../models/news");
const asyncHandler = require("../middlewares/async");
const slugify = require("slugify");

exports.addNews = asyncHandler(async(req, res, next) => {
    try {
        const slug = Math.floor(Math.random() * 10000000);
        const news = new News(req.body);
        news.slug = slugify(slug.toString());
        news.save()
            .then(() => {
                res.status(201).json({
                    success: true,
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: false,
                    error,
                });
            });
    } catch {
        res.status(400).json({
            status: false,
        });
    }

});
exports.getAll = asyncHandler(async(req, res, next) => {
    try {
        const pageNumber = req.query.page;
        const news = await News.find()
            .sort({ date: -1 })
            .limit(20)
            .skip((pageNumber - 1) * 20)
            .select(["name", "date"]);

        res.status(200).json({
            success: true,
            data: news,
        });
    } catch {
        res.status(400).json({
            status: false,
        });
    }

});
exports.getHome = asyncHandler(async(req, res, next) => {
    try {
        const pageNumber = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);

        const count = await News.countDocuments({ status: true });

        const news = await News.find()
            .sort({ date: -1 })
            .limit(limit)
            .skip((pageNumber - 1) * limit)
            .select(["name", "date", "image"]);

        res.status(200).json({
            success: true,
            count,
            data: news,
        });
    } catch {
        res.status(400).json({
            status: false,
        });
    }

});
exports.getById = asyncHandler(async(req, res, next) => {
    try {
        const news = await News.findById(req.params.id);
        res.status(200).json({
            success: true,
            data: news,
        });
    } catch {
        res.status(400).json({
            status: false,
        });
    }

});
exports.edit = asyncHandler(async(req, res) => {
    try {
        await News.updateOne({ _id: req.params.id }, { $set: req.body }, { new: true }).exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch {
        res.status(400).json({
            status: false,
        });
    }

});
exports.deleteNews = asyncHandler(async(req, res, next) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: [],
        });
    } catch {
        res.status(400).json({
            status: false,
        });
    }

});