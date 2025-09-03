const mongoose = require("mongoose");

const likeCommentSchema = mongoose.Schema({
    comment: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "comment",
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Auth",
    },
    type: { type: Number, default: 0 },
    date: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: true });

module.exports = mongoose.model("likecomment", likeCommentSchema);