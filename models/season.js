const mongoose = require("mongoose");

const SeasonSchema = new mongoose.Schema({
    name: {
        uz: { type: String, required: true },
        ru: { type: String, required: true },
    },
    description: {
        uz: { type: String, required: true },
        ru: { type: String, required: true },
    },
    category: [{
        type: mongoose.Schema.ObjectId,
        ref: "category",
        required: true,
    }, ],
    translator: [{
        type: mongoose.Schema.ObjectId,
        ref: "member",
        required: true,
    }, ],
    tarjimon: [{
        type: mongoose.Schema.ObjectId,
        ref: "member",
        required: true,
    }, ],

    rejissor: { type: String, required: true },
    length: { type: String },
    studia: { type: String, required: true },
    tayming: [{
        type: mongoose.Schema.ObjectId,
        ref: "member",
        required: true,
    }, ],
    price: {
        type: String,
        enum: ["free", "selling"],
        required: true,
    },
    janr: [{
        type: mongoose.Schema.ObjectId,
        ref: "janr",
        required: true,
    }, ],
    country: { type: String, required: true },
    rating: { type: Number, default: 0 },
    year: { type: String, required: true },
    num: { type: String },
    video: { type: String },
    url: { type: String },
    slug: { type: String, unique: true, lowercase: true },
    screens: {
        thumb: [{ type: String }],
        original: [{ type: String }],
    },
    image: {
        type: String,
    },
    // Tag qoshildi
    tags: [{ type: String }],
    type: { type: Number, default: 1 },
    view: { type: Number, default: 0 },
    tip: { type: String, enum: ["kino", "serial"], default: "serial" },
    date: { type: Date, default: Date.now() },
    status: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

//Cascade Delete
SeasonSchema.pre("remove", async function(next) {
    await this.model("seriya").deleteMany({ season: this._id });
    await this.model("slider").deleteMany({ serial: this._id });
    next();
});
module.exports = mongoose.model("season", SeasonSchema);