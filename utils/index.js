const fs = require("fs");
const path = require("path");

exports.deleteFile = (url) => {
    fs.unlink(path.join(path.dirname(__dirname) + url), (err) => {});
};
