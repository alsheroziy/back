const mongoose = require("mongoose");
const seriyaSchema = new mongoose.Schema(
  {
    name: {
      uz: { type: String, required: true },
      ru: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["active", "pending"],
      required: true,
      default: "active",
    },
    premery: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    video: { type: String, required: true },
    season: { type: mongoose.Schema.ObjectId, ref: "season", required: true },
    slug: { type: String, unique: true, lowercase: true },
    url: { type: String, required: true },
    length: { type: String, required: true },
    date: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);
module.exports = mongoose.model("seriya", seriyaSchema);
