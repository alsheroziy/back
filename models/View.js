const mongoose = require("mongoose");

const ViewSchema = new mongoose.Schema({
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "season",
        required: true,
    },
    count: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model("View", ViewSchema);