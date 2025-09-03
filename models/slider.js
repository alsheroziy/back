const mongoose = require("mongoose");

const SliderSchema = mongoose.Schema({
    serial: {
        type: mongoose.Schema.ObjectId,
        ref: "season",
    },
    date: { type: Date, default: Date.now() },
});
module.exports = mongoose.model("slider", SliderSchema);
