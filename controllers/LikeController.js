const Like = require("../models/Like");
const jwt = require("jsonwebtoken");
const Season = require("../models/season");
exports.create = async(req, res) => {

    try {
        const user = jwt.decode(req.headers.authorization.slice(7));
        let likeold = await Like.find({ user: user.id, season: req.body.season });

        if (!likeold.length) {
            const like = new Like(req.body);
            like.user = user.id;
            like.save().then(() => {
                res.status(200).json({ success: true, data: like });
            });
        } else {
            return res.status(400).json({ success: false });
        }
    } catch {
        return res.status(500).json({ status: false })
    }

};
exports.me = async(req, res) => {
    try {
        const user = jwt.decode(req.headers.authorization.slice(7));
        await Like.find({ user: user.id })
            .populate({
                path: "season",
                select: ["name", "image", "year", "price", "view"],
            })
            .exec((err, data) => {
                if (err) return res.status(400).json({ success: false, err });
                return res.status(200).json({ success: true, data });
            });
    } catch {
        return res.status(500).json({ status: false })
    }

};
exports.delete = async(req, res, next) => {
    try {
        await Like.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: [],
        });
    } catch {
        return res.status(500).json({ status: false })
    }

};