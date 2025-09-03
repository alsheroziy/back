const File = require("../models/File");
const { sharpImage } = require("../utils/sharp.js");
exports.create = (req, res) => {


    try {
        const { filename } = req.file;
        // sharpImage(filename);

        const file = new File({
            path: `/public/temp/${filename}`,
        });

        file.save().then(() => {
            return res.status(200).json({ success: true, data: file });
        });
    } catch {
        return res.status(500).json({ status: false })
    }

};

// const File = require("../models/File");
// exports.create = (req, res) => {
//     const file = new File({
//         path: `/${req.file.path}`,
//     });

//     file.save().then(() => {
//         return res.status(200).json({ success: true, data: file });
//     });
// };