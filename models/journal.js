const mongoose = require("mongoose");
const JournalSchema = new mongoose.Schema({
    system: {
        type: String,
        index: true,
        required: true,
    },
    amount: {
        type: Number,
        index: true,
        required: true,
    },
    driver: {
        type: mongoose.Schema.ObjectId,
        ref: "Auth",
        index: true,
        required: true,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Journal", JournalSchema);