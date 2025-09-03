const mongoose = require("mongoose");
const Tarif = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "Auth",
        index: true,
        required: true,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Tarif", Tarif);