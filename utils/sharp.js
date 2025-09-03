const sharp = require("sharp");
const path = require("path");
const { deleteFile } = require(".");
exports.sharpImage = async(filename) => {
    try {
        sharp(path.join(path.dirname(__dirname) + `/public/temp/${filename}`))
            .resize(285, 366)
            .jpeg({ quality: 50 })
            .toFile(
                path.join(
                    path.dirname(__dirname) +
                    `/public/uploads/cinema/${filename}`
                ),
                (err) => {
                    if (err) {
                        console.log(err);
                    }
                    deleteFile(`/public/temp/${filename}`);
                }
            );
    } catch (error) {
        console.log(error);
    }
};