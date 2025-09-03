const mongoose = require("mongoose");
const requestLog = new mongoose.Schema({
    body: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("requestlog", requestLog);