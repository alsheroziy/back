const Kino = require("../models/kino");
const asyncHandler = require("../middlewares/async");
const slugify = require("slugify");
const ErrorResponse = require("../utils/errorResponse");
const Comment = require("../models/comment");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const JWT = require("jsonwebtoken");
const User = require("../models/auth");
const md5 = require("md5");

exports.addCinema = asyncHandler(async(req, res, next) => {

    try {
        const kino = new Kino(req.body);
        kino.slug = Math.floor(Math.random() * 9999999999999).toString();
        kino.save()
            .then(() => {
                res.status(201).json({
                    success: true,
                    data: kino,
                });
            })
            .catch((error) => {
                res.send(error);
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getAll = asyncHandler(async(req, res, next) => {
    try {
        const kino = await Kino.find()
            .sort({ date: -1 })

        .select({
                name: 1,
                category: 1,
                image: 1,
                rating: 1,
                price: 1,
                date: 1,
                type: 1,
            })
            .populate("category");

        console.log(kino)

        res.status(200).json({
            success: true,
            data: kino,
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getAdmin = asyncHandler(async(req, res, next) => {

    try {
        const count = await Kino.countDocuments();
        const kino = await Kino.find()
            .sort({ date: -1 })
            .skip((req.query.page - 1) * 20)
            .limit(20)
            .select({
                name: 1,
                category: 1,
                image: 1,
                rating: 1,
                price: 1,
                date: 1,
                type: 1,
            })
            .populate({ path: "category", select: "nameuz" });

        res.status(200).json({
            success: true,
            count,
            data: kino,
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getById = asyncHandler(async(req, res, next) => {

    try {
        const comment = await Comment.find({ kinoId: req.params.id })
            .sort({ date: -1 })
            .populate(["user"]);
        // Find by id and compare user's id and kino's id and check status
        const kino = await Kino.findById(req.params.id).populate([
            "category",
            "janr",
            "translator",
            "tayming",
            "tarjimon",
        ]);

        if (kino.price === "free") {
            return res.status(200).json({
                success: true,
                data: kino,
                comment,
            });
        } else {
            // Compare user's id and kino's id and check status
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({
                    success: false,
                    data: "foydalanuvchi statusi vip emas",
                });
            }
            const user = JWT.decode(token.slice(7, token.length));
            const me = await User.findOne({ _id: user.id })
                .sort({ date: -1 })
                .populate("user");



            if (me.status === "vip" && kino.price === "selling") {
                return res.status(200).json({
                    success: true,
                    data: kino,
                    comment,
                });
            } else if (me.status !== "vip" && kino.price === "selling") {
                return res.status(403).json({
                    success: false,
                    data: "foydalanuvchi statusi vip emas",
                });
            }
        }
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.deleteById = asyncHandler(async(req, res, next) => {
    try {
        await Kino.findById({ _id: req.params.id }).exec(async(error, data) => {
            if (error) {
                res.send(error);
            } else {
                const thumb = data.screens.thumb;
                const original = data.screens.original;
                // original faylni o'chiradi
                for (const file of original) {
                    let fileOriginal = path.join(path.dirname(__dirname) + file);
                    fs.unlink(fileOriginal, async(error) => {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
                // thumb fayni o'chiradi
                for (const file of thumb) {
                    let fileThump = path.join(path.dirname(__dirname) + file);
                    fs.unlink(fileThump, async(error) => {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
                // poster faylni o'chiradi
                let poster = path.join(
                    path.dirname(__dirname) +
                    `/public/uploads/cinema/org/${data.image}`
                );
                fs.unlink(poster, async(error) => {
                    if (error) {
                        console.log(error);
                    }
                });

                // :id bo'yicha o'chirib tashlaydi
                await Kino.findByIdAndDelete(req.params.id);
                res.status(200).json({
                    success: true,
                    data: [],
                });
            }
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.updateById = asyncHandler(async(req, res, next) => {
    try {
        await Kino.updateOne({ _id: req.params.id }, { $set: req.body }, { new: true },
            (err, data) => {
                if (err) return res.status(400).json({ success: false, err });
                return res.status(200).json({ success: true });
            }
        );
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.sortByCat = asyncHandler(async(req, res, next) => {
    try {
        const pageNumber = req.query.page;
        const limit = req.query.limit;
        let productLimit;
        if (!limit) {
            productLimit = 20;
        } else {
            productLimit = limit;
        }

        let reqQuery = {...req.query };
        // Create query String
        let queryStr = JSON.stringify(reqQuery);
        const kino = await Kino.find(JSON.parse(queryStr))

        .skip((pageNumber - 1) * productLimit)
            .limit(productLimit)
            .sort({ date: -1 })
            .select({ name: 1, category: 1, type: 1, image: 1, year: 1, janr: 1 })
            .populate({ path: "category", select: "nameuz" });

        res.status(200).json({
            success: true,
            data: kino,
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});

exports.editPoster = asyncHandler(async(req, res, next) => {
    try {
        let compressedImageFileSavePath = path.join(
            __dirname,
            "../public/uploads/cinema/org",
            md5(new Date().getTime()) + ".jpg"
        );
        await sharp(req.file.path)
            .resize(450, 600)
            .jpeg({
                quality: 60,
            })
            .toFile(compressedImageFileSavePath, (error) => {
                if (error) {
                    res.send(error);
                }
                fs.unlink(req.file.path, async(error) => {
                    if (error) {
                        res.send(error);
                    }
                });
            });

        const kino = await Kino.findByIdAndUpdate(req.params.id);
        const images = path.join(path.dirname(__dirname) + kino.image);

        kino.image = `/public/uploads/cinema/org/${path.basename(
            compressedImageFileSavePath
        )}`;

        kino.save({ validateBeforeSave: false })
            .then(() => {
                res.status(200).json({
                    success: true,
                    data: kino,
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: true,
                    data: error,
                });
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});

exports.editScreens = asyncHandler(async(req, res, next) => {

    try {
        const files = req.files;
        const urls = [];
        const thumb = [];
        for (const file of files) {
            const { filename } = file;
            urls.push(`/public/uploads/cinema/org/${filename}`);
            thumb.push(`/public/uploads/cinema/thumb/${filename}`);
            await sharp(
                    path.join(
                        path.dirname(__dirname) +
                        `/public/uploads/cinema/org/${filename}`
                    )
                )
                .resize(100, 100)
                .jpeg({
                    quality: 60,
                })
                .toFile(
                    path.join(
                        path.dirname(__dirname) +
                        `/public/uploads/cinema/thumb/${filename}`
                    ),
                    (err) => {
                        if (err) {
                            throw err;
                        }
                    }
                );
        }

        const kino = await Kino.findByIdAndUpdate(req.params.id);

        const array1 = kino.screens.thumb;
        const array2 = kino.screens.original;

        for (let i = 0; i < array1.length; i++) {
            const images = path.join(path.dirname(__dirname) + array1[i]);
            fs.unlink(images, async(error) => {
                if (error) {
                    res.send(error);
                }
            });

            const rasm = path.join(path.dirname(__dirname) + array2[i]);
            fs.unlink(rasm, async(error) => {
                if (error) {
                    res.send(error);
                }
            });
        }

        kino.screens.thumb = thumb;
        kino.screens.original = urls;

        kino.save({ validateBeforeSave: false })
            .then(() => {
                res.status(200).json({
                    success: true,
                    data: kino,
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: true,
                    data: error,
                });
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});