const asyncHandler = require("../middlewares/async");
const Anotatsiya = require("../models/anotatsiya");

exports.add = asyncHandler(async(req, res, next) => {

    try {
        const anotatsiya = new Anotatsiya(req.body);
        anotatsiya
            .save()
            .then(() => {
                res.status(201).json({
                    success: true,
                    data: anotatsiya,
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: true,
                    data: error,
                });
            });
    } catch {
        return res.status(400).json({
            status: false
        })
    }

});
exports.getAll = asyncHandler(async(req, res, next) => {

    try {
        const anotatsiya = await Anotatsiya.find().sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            data: anotatsiya,
        });
    } catch {
        return res.status(400).json({
            status: false
        })
    }

});
exports.getHome = asyncHandler(async(req, res, next) => {
    try {
        const anotatsiya = await Anotatsiya.find().sort({ updatedAt: -1 }).limit(1);

        res.status(200).json({
            success: true,
            data: anotatsiya ? anotatsiya[0] : null,
        });
    } catch {
        return res.status(400).json({
            status: false
        })
    }

});

exports.getOne = asyncHandler(async(req, res, next) => {
    try {
        const anotatsiya = await Anotatsiya.findOne({ _id: req.params.id });

        res.status(201).json({
            success: true,
            data: anotatsiya,
        });
    } catch {
        return res.status(400).json({
            status: false
        })
    }

});

exports.update = asyncHandler(async(req, res, next) => {
    try {
        await Anotatsiya.updateOne({ _id: req.params.id }, { $set: req.body },
            (err, data) => {
                if (err) return res.status(400).json({ success: false });
                return res.status(200).json({ success: true });
            }
        );
    } catch {
        return res.status(400).json({
            status: false
        })
    }

});
exports.deleteById = asyncHandler(async(req, res, next) => {
    try {
        await Anotatsiya.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: [],
        });
    } catch {
        return res.status(400).json({
            status: false
        })
    }

});