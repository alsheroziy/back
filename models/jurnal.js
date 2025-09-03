const mongoose = require("mongoose");

const jurnalSchema = mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId,
        ref: "Auths",
        required: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    type: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
    },
});

jurnalSchema.pre("save", async function(next) {
    if (this.status === false) {
        return console.log("this status false");
        next();
    } else if (this.status === true) {
        let user = await this.model("Users").findByIdAndUpdate({
            _id: this.userID,
        });
        user.balance += this.amount;

        user.save({ validateBeforeSave: false });
        next();
    }
});
module.exports = mongoose.model("jurnal", jurnalSchema);