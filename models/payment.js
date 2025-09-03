const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    redirect_url: {
        ios: {
            type: String,
            default: ""
        },
        android: {
            type: String,
            default: ""
        }
    },
    //ddd
    type: {
        type: Number,
        unique: true,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    message: {
        type: String,
        default: ""
    },

}, {
    timestamps: true,
});

module.exports = mongoose.model("payment", paymentSchema);