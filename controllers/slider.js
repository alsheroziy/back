const Slider = require("../models/slider");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const checkCategoryForRestricted = require("../utils/checkCategoryForRestricted");

exports.addSlider = asyncHandler(async(req, res, next) => {
    try {
        const slider = await Slider.create(req.body);
        res.status(201).json({
            success: true,
            slider,
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }
});

exports.getSlidersForAdminPage = asyncHandler(async(req, res, next) => {
    try {
        let sliders = await Slider.find()
            .sort({ date: -1 })
            .populate({ path: "serial", select: ["name", "image"] });

        res.status(200).json({
            success: true,
            data: sliders,
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

});
exports.getClient = asyncHandler(async(req, res, next) => {
    try {
        let sliders = await Slider.find()
            .sort({ date: -1 })
            .populate([{
                path: "serial",
                select: [
                    "category",
                    "name",
                    "image",
                    "description",
                    "year",
                    "screens",
                ],
                populate: { path: "category", select: ["nameuz", "nameru", "isRestricted"] },
            }, ]);

        if (!req.allowedCountry) {
            console.log(sliders)
            sliders = sliders.filter(function (item) {
                return !checkCategoryForRestricted(item.serial.category)
            })
        }

        //.populate(['kino','serial'])

        res.status(200).json({
            success: true,
            data: sliders,
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

});
exports.deleteSlider = asyncHandler(async(req, res, next) => {
    try {
        await Slider.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: [],
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

});