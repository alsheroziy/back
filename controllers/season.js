const Season = require("../models/season");
const mongoose = require("mongoose");
const Seriya = require("../models/seriya");
const Slider = require("../models/slider");
const SeriyaCommnent = require("../models/commentSerial");
const asyncHandler = require("../middlewares/async");
const fs = require("fs");
const path = require("path");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const Auth = require("../models/auth");
const Comment = require("../models/comment");
const Category = require("../models/category");
const Auths = require("../models/auth");
const md5 = require("md5");
const Views = require("../models/View");
const axios = require("axios");
const checkCategoryForRestricted = require("../utils/checkCategoryForRestricted");
// Season Controller
exports.addSeason = asyncHandler(async (req, res, next) => {
  try {
    const season = new Season(req.body);
    season.slug = Math.floor(Math.random() * 9999999999999).toString();
    season
      .save()
      .then(() => {
        res.status(201).json({
          success: true,
          data: season,
        });
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          data: error,
        });
      });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.getAllSeason = asyncHandler(async (req, res, next) => {
  try {
    let season = await Season.find()
      .sort({ date: -1 })
      .select({
        name: 1,
        category: 1,
        image: 1,
        rating: 1,
        janr: 1,
        price: 1,
        date: 1,
        type: 1,
        view: 1,
      })
      .populate("category");

    if (!req.allowedCountry) {
      season = season.filter((item) => {
        return checkCategoryForRestricted(item.category);
      });
    }

    res.status(200).json({
      success: true,
      data: season,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.getHome = asyncHandler(async (req, res, next) => {
  try {
    const count = await Season.countDocuments({
      category: { $in: [req.body.category, "6544eb355722b851d0525e1b"] },
    });

    const pageNumber = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    let season = await Season.find({ category: { $in: req.body.category } })
      .sort({ date: -1 })
      .limit(limit)
      .skip((pageNumber - 1) * limit)
      .select({
        name: 1,
        category: 1,
        image: 1,
        rating: 1,
        janr: 1,
        price: 1,
        date: 1,
        type: 1,
        year: 1,
        view: 1,
        num: 1,
      });

    if (!req.allowedCountry) {
      season = season.filter((item) => {
        return checkCategoryForRestricted(item.category);
      });
    }

    res.status(200).json({
      success: true,
      count,
      data: season,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.getAdmin = asyncHandler(async (req, res, next) => {
  try {
    const count = await Season.countDocuments({
      "name.uz": { $regex: req.body.search, $options: "i" },
    });
    const season = await Season.find({
      "name.uz": { $regex: req.body.search, $options: "i" },
    })
      .sort({ date: -1 })
      .skip((req.query.page - 1) * 20)
      .limit(20)
      .select({
        name: 1,
        category: 1,
        image: 1,
        price: 1,
        type: 1,
        date: 1,
        updatedAt: 1,
      })
      .populate({ path: "category", select: "nameuz" });

    res.status(200).json({
      success: true,
      count,
      data: season,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});

exports.search = asyncHandler(async (req, res, next) => {
  try {
    let season = await Season.find({
      "name.uz": { $regex: req.query.text, $options: "i" },
    })
      .sort({ updatedAt: -1 })
      .select({
        name: 1,
        image: 1,
      })
      .populate("category");

    if (!req.allowedCountry) {
      season = season.filter((item) => {
        return !checkCategoryForRestricted(item.category);
      });
    }

    res.status(200).json({
      success: true,
      data: season,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.getByIdSeason = asyncHandler(async (req, res, next) => {
  try {
    // Find by id and compare user's id and seasons's id and check status
    let userId = null;

    const token = req.headers.authorization;

    if (token) {
      const user = JWT.decode(token.slice(7));
      const candidate = await Auths.findOne({ _id: user.id }).select({
        password: 0,
      });

      if (candidate) {
        userId = candidate._id;
      }
    }

    let comment = await Comment.aggregate([
      {
        $match: {
          season: mongoose.Types.ObjectId(req.params.id),
          status: true,
        },
      },
      {
        $lookup: {
          from: "likecomments",
          let: { like: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$comment", "$$like"] } } },
            {
              $facet: {
                countLike: [
                  {
                    $group: { _id: { $eq: ["$type", 1] }, count: { $sum: 1 } },
                  },
                ],
                countDislike: [
                  {
                    $group: { _id: { $eq: ["$type", -1] }, count: { $sum: 1 } },
                  },
                ],
                ownLike: userId
                  ? [
                      {
                        $group: {
                          _id: {
                            $eq: ["$user", mongoose.Types.ObjectId(userId)],
                          },
                          status: { $first: "$type" },
                        },
                      },
                    ]
                  : [],
              },
            },
            {
              $project: {
                countLike: {
                  $let: {
                    vars: {
                      count: { $arrayElemAt: ["$countLike", 0] },
                    },
                    in: "$$count.count",
                  },
                },
                countDislike: {
                  $let: {
                    vars: {
                      count: { $arrayElemAt: ["$countDislike", 0] },
                    },
                    in: "$$count.count",
                  },
                },
                ownLikeType: {
                  $let: {
                    vars: {
                      temp: { $arrayElemAt: ["$ownLike", 0] },
                    },
                    in: "$$temp.status",
                  },
                },
              },
            },
          ],
          as: "likesCount",
        },
      },
      { $unwind: { path: "$likesCount", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "auths",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      // {
      //     $project: {
      //         likesCount: "$likesCount",
      //         message: 1
      //     }
      // }
    ]);

    // const comment = await Comment.find({ season: req.params.id })
    //     .sort({ createdAt: -1 })
    //     .populate(["user"]);

    let count;

    let seria = await Seriya.find({ season: req.params.id })
      .sort({ "name.uz": -1 })
      .collation({ locale: "en_US", numericOrdering: true });

    const season = await Season.findById(req.params.id).populate([
      "category",
      "janr",
      "translator",
      "tayming",
      "tarjimon",
      "seriya",
    ]);

    console.log("Season", season);

    const isRestrictedSeason = checkCategoryForRestricted(season.category);
    if (req.allowedCountry === false && isRestrictedSeason) {
      res.status(200).json({
        success: true,
        status: 201,
      });
    }

    let view = season.view + 1;

    await Season.updateOne(
      { _id: req.params.id },
      {
        $set: {
          view,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      status: 201,
      data: season,
      comment,
      seria,
      count,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.deleteSeason = async (req, res) => {
  try {
    await Slider.deleteMany({ serial: req.params.id });
    await Season.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: [] });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};

exports.updateSeason = asyncHandler(async (req, res, next) => {
  try {
    req.body.date = Date.now();
    await Season.updateOne(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).exec((err, data) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true });
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});

//

exports.filter = asyncHandler(async (req, res, next) => {
  function overlaps(A, B) {
    for (const a of A) {
      for (const b of B) {
        if (a.toString() === b.toString()) return true;
      }
    }
    return false;
  }

  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    let full = await Season.find()
      .sort({ date: -1 })
      .select({
        name: 1,
        category: 1,
        image: 1,
        rating: 1,
        janr: 1,
        price: 1,
        date: 1,
        year: 1,
        type: 1,
        view: 1,
      })
      .populate("category");

    let season = full;

    if (!req.allowedCountry) {
      season = season.filter(
        (item) => !checkCategoryForRestricted(item.category)
      );
    }

    if (req.body.category && req.body.category.length) {
      season = season.filter((item) =>
        req.body.category.includes(item.category[0].id)
      );
    }

    if (req.body.janr && req.body.janr.length) {
      season = season.filter((item) => {
        //console.log(req.body.janr, item.janr)
        return overlaps(req.body.janr, item.janr);
      });
    }
    if (req.body.year && req.body.year.length) {
      season = season.filter((item) => req.body.year.includes(item.year));
    }

    const count = season.length;
    season = season.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      success: true,
      data: season,
      //full: full,
      count,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});

exports.getByAdminId = asyncHandler(async (req, res) => {
  try {
    await Season.findOne({ _id: req.params.id }).exec((err, data) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true, data });
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
// Seriya Controller
exports.addSeriya = asyncHandler(async (req, res, next) => {
  try {
    const seriya = new Seriya(req.body);
    let season = await Season.findOne({ _id: req.body.season });

    seriya.slug = Math.floor(Math.random() * 9999999999999).toString();

    seriya
      .save()
      .then(() => {
        if (req.body.isNot) {
          axios({
            method: "POST",
            url: "https://fcm.googleapis.com/fcm/send",
            data: {
              to: `/topics/${req.body.season}`, //news_ru double send
              notification: {
                title: `${season.name.uz}ga yangi seriya qo'shildi`,
                body: `${req.body.name.uz}`,
                sound: "default",
              },
              data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                page: "News",
                id: req.body.season, //movie id
              },
              priority: "high",
            },
            headers: {
              Authorization:
                "key=AAAAHS3fn2U:APA91bH3WSCDM6Al5rtvGEtIUygQayJL36juLtJNZO1xs8Wf8_NeTUNGN3YuNmLCeuE3Glt4ZiRi5M4DRpOT5WIVMLAj3lDbLmZfsB7-Xmsd6FmBWVVJ3wcaqrRKaEU8Z2ZjZG-O9J_J",
            },
          });
        }
        res.status(201).json({
          success: true,
          data: seriya,
        });
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          data: error,
        });
      });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.deleteSeriya = asyncHandler(async (req, res, next) => {
  try {
    await Seriya.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: [],
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.updateSeriya = asyncHandler(async (req, res, next) => {
  try {
    await Seriya.updateOne(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).exec((err, data) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true });
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.getByAdminSeriya = asyncHandler(async (req, res) => {
  try {
    const count = await Seriya.countDocuments({ season: req.params.id });
    const page = parseInt(req.query.page);

    await Seriya.find({ season: req.params.id })
      .sort("-name.uz")
      .collation({ locale: "en_US", numericOrdering: true })
      .skip((page - 1) * 10)
      .limit(10)
      .populate({ path: "season", select: "name" })
      .exec((err, data) => {
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, data, count });
      });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.getSeriaOne = asyncHandler(async (req, res) => {
  try {
    await Seriya.findById({ _id: req.params.id }).exec((err, data) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true, data });
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
