const mongoose = require("mongoose");

const VersionSchema = mongoose.Schema({
  appName: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  isRequired: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("version", VersionSchema);
