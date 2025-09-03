const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    message: {
        type: String,
        required: [true, "Please add a message"],
        trim: true,
    },
    season: {
        type: mongoose.Schema.ObjectId,
        ref: "season",
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "Auth",
    },
    status: { type: Boolean, default: false },
    date: {
        type: Date,
        default: Date.now(),
    },
}, { timestamps: true });

module.exports = mongoose.model("comment", commentSchema);