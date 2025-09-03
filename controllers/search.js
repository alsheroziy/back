const Kino = require('../models/kino')
const asyncHandler = require('../middlewares/async')
const Serial = require('../models/season')
exports.search = asyncHandler(async(req, res, next) => {

    try {
        const serial = await Serial.aggregate([{
                $match: {
                    $or: [
                        { "name.uz": { $regex: req.query.search, $options: "$i" } },
                        { "name.ru": { $regex: req.query.search, $options: "$i" } },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    tts: 1,
                    image: 1,

                }
            }
        ])
        await Kino.aggregate([{
                $match: {
                    $or: [
                        { "name.uz": { $regex: req.query.search, $options: "$i" } },
                        { "name.ru": { $regex: req.query.search, $options: "$i" } },
                    ],
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    tts: 1
                }
            }
        ]).exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });

            return res.status(200).json({ success: true, kino: data, serial: serial })
        })
    } catch {
        return res.status(500).json({
            status: false
        })
    }

})
exports.filterByYear = asyncHandler(async(req, res, next) => {
    try {
        const pageNumber = req.query.page
        const kino = await Kino.find({ info: { year: req.query.year } })
            .sort({ date: -1 })
            .populate({ path: 'category', select: 'name' })
            .skip((pageNumber - 1) * 20)
            .limit(20)
            .sort({ date: -1 })
            .select({ name: 1, category: 1, tts: 1, image: 1 })

        res.status(200).json({
            success: true,
            data: kino
        })
    } catch {
        return res.status(500).json({
            status: false
        })
    }

})