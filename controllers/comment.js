const jwt = require("jsonwebtoken");
const Comment = require("../models/comment");
const JWT = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const Auths = require("../models/auth");
const LikeComment = require("../models/likeComment");
// @description Write Comment
// @route POST /api/products/:productId/comment
// @access Private
exports.writeComment = asyncHandler(async(req, res) => {

    try {
        const user = jwt.decode(req.headers.authorization.slice(7));

        const comment = new Comment({
            message: req.body.message,
            season: req.body.season,
            user: user.id,
        });
        comment
            .save()
            .then(() => {
                res.status(201).json({
                    success: true,
                });
            })
            .catch((error) => {
                res.send(error).json({
                    success: false,
                    error,
                });
            });
    } catch {
        return res.status(500).json({ status: false })
    }


});
exports.allComments = asyncHandler(async(req, res) => {
    try {
        const count = await Comment.countDocuments();
        const comments = await Comment.find()
            .sort({ date: -1 })
            .skip((req.query.page - 1) * 20)
            .limit(20)
            .populate(["user"]);
        res.status(200).json({
            success: true,
            count,
            data: comments,
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.editStatus = asyncHandler(async(req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id);
        comment.status = req.body.status;
        comment
            .save({ validateBeforeSave: false })
            .then(() => {
                res.status(200).json({
                    success: true,
                });
            })
            .catch((error) => {
                res.send(error);
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});
// @description Delete single Comment
// @route DELETE /api/comment/:id
// @access Private/Admin
exports.deleteComment = asyncHandler(async(req, res, next) => {
    try {
        let comment = await Comment.findByIdAndRemove(req.params.id);

        res.status(201).json({ success: true });
    } catch {
        return res.status(500).json({ status: false })
    }

});

// exports.getCommentById = asyncHandler(async (req, res, next) => {
//     const comment = await Comment.findOne({kinoId: req.params.id})
//         .sort({date: -1})
//         .populate('product')
//
//     return res.status(200).json({
//         success: true,
//         data: comment
//     })
//
// })

exports.clickLike = async(req, res) => {
    try {
        // try {
        const token = req.headers.authorization;
        if (token) {
            const user = JWT.decode(token.slice(7));
            const candidate = await Auths.findOne({ _id: user.id }).select({
                password: 0,
            });

            let body = {
                comment: req.body.comment,
                user: candidate._id,
                type: req.body.type,
            };

            const oldLike = await LikeComment.findOne({
                user: candidate._id,
                comment: req.body.comment,
            });
            console.log("user", candidate);
            if (oldLike) {
                await LikeComment.findOneAndUpdate({ _id: oldLike._id }, { $set: body });
                console.log("oldLike", oldLike);
            } else {
                const likeComment = new LikeComment(body);
                await likeComment.save();
            }
            return res.status(200).json({
                success: true,
            });
        } else {
            return res.status(400).json({
                success: false,
            });
        }
    } catch {
        return res.status(500).json({ status: false })
    }

};