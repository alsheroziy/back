const mongoose = require("mongoose");

const anotatsiyaSchema = mongoose.Schema({
    name: {
        uz: { type: String, required: true },
        ru: { type: String, required: true },
    },
    description: {
        uz: { type: String, required: true },
        ru: { type: String, required: true },
    },
    video: { type: String, required: true },
}, { timestamps: true });
module.exports = mongoose.model("anotatsiya", anotatsiyaSchema);