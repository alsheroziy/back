const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const User = require("../models/auth");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");

// @description Update image
// @route POST /api/upload
// @access Private/Admin
exports.updateFile = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = jwt.decode(token.slice(7, token.length));

    await User.updateOne(
      {_id: user.id},
      {$set: {photo: req.file.path}},
      {new: true},
      (err, data) => {
        if (err) return res.status(400).json({success: false});
        return res.status(200).json({success: true});
      }
    );
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
// @description Get all users
// @route GET /api/users
// @access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    const count = await User.countDocuments({
      name: {$regex: req.body.search, $options: "i"},
    });
    const users = await User.find({
      name: {$regex: req.body.search, $options: "i"},
    })
      .sort({createdAt: -1})
      .skip((req.query.page - 1) * 20)
      .limit(20);
    res.status(200).json({
      success: true,
      count,
      data: users,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
// @description Get single user
// @route GET /api/users/:id
// @access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return next(
        new ErrorResponse(`Resourse not found with id of ${req.params.id}`, 404)
      );
    res.status(200).json({success: true, data: user});
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
// @description Create user
// @route POST /api/users
// @access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json({success: true, data: user});
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
// @description Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user)
      return next(
        new ErrorResponse(`Resourse not found with id of ${req.params.id}`, 404)
      );
    res.status(200).json({success: true, data: user});
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
exports.editUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;

      user.tel = req.body.tel;
      user.role = req.body.role;

      user
        .save({validateBeforeSave: false})
        .then(() => {
          res.status(200).json({success: true});
        })
        .catch((e) => {
          res.status(400).json({success: false, e});
        });
    } else {
      res.status(404).json({
        success: false,
        data: "User not found",
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});

exports.search = asyncHandler(async (req, res) => {
  try {
    let season = await User.find({
      name: {$regex: req.params.text, $options: "i"},
    })
      .sort({createdAt: -1})
      .skip((req.query.page - 1) * 20)
      .limit(20);
    return res.status(200).json({success: true, data: season});
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});
