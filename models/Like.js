const mongoose = require("mongoose");
const LikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    season: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "season",
    },
});
module.exports = mongoose.model("Like", LikeSchema);