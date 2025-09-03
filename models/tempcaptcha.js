const mongoose = require("mongoose");

const TempCaptchaSchema = mongoose.Schema({
  captcha: {type: String, default: ""},
  ip: {type: String, default: ""},
});
module.exports = mongoose.model("tempcaptcha", TempCaptchaSchema);
