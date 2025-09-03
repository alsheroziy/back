const Janr = require("../models/janr");
const { Products } = require("../models/product");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const Kino = require("../models/kino");
const mongoose = require("mongoose");
const Season = require("../models/season");
// @description Get all Categories
// @route GET /api/category
// @access Public
exports.getJanrs = asyncHandler(async(req, res, next) => {


    try {
        const janr = await Janr.find();

        res.status(200).json({ success: true, data: janr });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getAdmin = asyncHandler(async(req, res, next) => {
    try {
        const count = await Janr.countDocuments();
        const janr = await Janr.find()
            .sort({ createdAt: -1 })
            .skip((req.query.page - 1) * 20)
            .limit(20);

        res.status(200).json({ success: true, count, data: janr });
    } catch {
        return res.status(500).json({ status: false })
    }

});

// @description Create Category
// @route POST /api/category
// @access Private/(Admin or Publisher)
exports.createJanr = asyncHandler(async(req, res, next) => {
    try {
        const category = await Janr.create(req.body);
        res.status(201).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }

});

// @description Get single Category
// @route GET /api/category/:categoryId
// @access Private/(Admin or Publisher)
exports.getJanr = asyncHandler(async(req, res, next) => {
    try {
        const janr = await Janr.findById(req.params.janrId);
        if (!janr)
            return next(
                new ErrorResponse(
                    `Resourse not found with id of ${req.params.janrId}`,
                    404
                )
            );
        res.status(200).json({ success: true, data: janr });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getByJanr = asyncHandler(async(req, res) => {
    try {
        const serial = await Season.aggregate([
            { $unwind: "$janr" },
            { $match: { janr: mongoose.Types.ObjectId(req.params.id) } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    tts: 1,
                },
            },
        ]);
        await Kino.aggregate([
            { $unwind: "$janr" },
            { $match: { janr: mongoose.Types.ObjectId(req.params.id) } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    tts: 1,
                },
            },
        ]).exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });

            return res
                .status(200)
                .json({ success: true, kino: data, serial: serial });
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getYear = asyncHandler(async(req, res) => {
    try {
        const serial = await Season.aggregate([
            { $match: { year: req.query.year } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    tts: 1,
                },
            },
        ]);
        await Kino.aggregate([
            { $match: { year: req.query.year } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    tts: 1,
                },
            },
        ]).exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });

            return res
                .status(200)
                .json({ success: true, kino: data, serial: serial });
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
// @description update Category
// @route PUT /api/category/:categoryId
// @access Private/Admin
exports.updateJanr = asyncHandler(async(req, res, next) => {
    try {
        const category = await Janr.findByIdAndUpdate(req.params.janrId, req.body, {
            new: true,
            runValidators: true,
        });
        if (!category)
            return next(
                new ErrorResponse(
                    `Resourse not found with id of ${req.params.categoryId}`,
                    404
                )
            );
        res.status(200).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }

});

// @description delete single Category
// @route DELETE /api/category
// @access Private/Admin
exports.deleteJanr = asyncHandler(async(req, res, next) => {
    try {
        const category = await Janr.findByIdAndRemove(req.params.janrId);
        if (!category)
            return next(
                new ErrorResponse(
                    `Resourse not found with id of ${req.params.janrId}`,
                    404
                )
            );

        res.status(200).json({ success: true, data: category });
    } catch {
        return res.status(500).json({ status: false })
    }

});