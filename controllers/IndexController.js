const Slider = require("../models/slider");
const asynHandler = require("../middlewares/async");
const News = require("../models/news");
const Anotatsiya = require("../models/anotatsiya");
const Kino = require("../models/kino");
const Season = require("../models/season");
const User = require("../models/auth");
const Member = require("../models/members");
const mongoose = require("mongoose");
exports.index = asynHandler(async(req, res, next) => {

    try {
        const sliders = await Slider.find()
            .sort({ date: -1 })
            .populate({
                path: "kino",
                select: ["name", "image", "screens", "description", "rating"],
            })
            .populate({
                path: "serial",
                select: ["name", "image", "screens", "description", "rating"],
            });
        // .limit(5)
        const news = await News.find()
            .sort({ date: -1 })
            // .limit(3)
            .select(["name", "date", "slug", "image"]);
        const anotatsiya = await Anotatsiya.find({ status: true }).sort({
            date: -1,
        });
        // .limit(1)
        const kino = await Kino.find()
            // .limit(20)
            .sort({ date: -1 })
            .select({
                name: 1,
                category: 1,
                image: 1,
                rating: 1,
                year: 1,
                janr: 1,
                date: 1,
                description: 1,
                price: 1,
            })
            .populate({ path: "category", select: "nameuz" })
            .populate(["janr"]);

        res.status(200).json({
            success: true,
            sliders,
            news,
            anotatsiya,
            kino,
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

});
exports.getBy = async(req, res) => {
    try {
        const skip = (req.query.page - 1) * 10;
        const count = await Season.countDocuments();
        await Season.find()
            // .limit(20)
            .sort({ date: -1 })
            .limit(10)
            .skip(skip)
            .populate("category")
            .populate("janr")
            .exec((err, data) => {
                if (err) console.log(err);
                return res.status(200).json({ success: true, data, count });
            });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};
exports.dashboard = asynHandler(async(req, res) => {
    try {
        const users = await User.countDocuments();
        const kino = await Kino.countDocuments();
        const season = await Season.countDocuments();
        const member = await Member.countDocuments();
        const user = await User.find().sort({ createdAt: -1 }).limit(15);
        return res
            .status(200)
            .json({ success: true, data: { users, kino, season, member, user } });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

});
exports.filter = asynHandler(async(req, res) => {
    try {
        let dts = [];
        let cts = [];
        const { category, year, janr, search, page } = req.query;
        if (categor != "all") {
            dts.push({ $match: { category: mongoose.Types.ObjectId(category) } });
            cts.push({ $match: { category: mongoose.Types.ObjectId(category) } });
        }
        if (year != "all") {
            dts.push({ $match: { year: year } });
            cts.push({ $match: { year: year } });
        }
        if (janr != "all") {
            dts.push({ $match: { janr: mongoose.Types.ObjectId(janr) } });
            cts.push({ $match: { janr: mongoose.Types.ObjectId(janr) } });
        }
        if (search != "all") {
            dts.push({ $match: { janr: { $regex: search, $options: "$i" } } });
            cts.push({ $match: { janr: { $regex: search, $options: "$i" } } });
        }
        dts.push({ $sort: { createdAt: -1 } }, { $skip: (page - 1) * 9 }, { $limit: 9 });
        const count = await Season.countDocuments(cts);
        await Season.aggregate(dts).exec((err, data) => {
            if (err) return res.status(400).json({ success: false, err });
            return res
                .status(200)
                .json({ success: true, data, count: count.length });
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

});