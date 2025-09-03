const Users = require("../models/auth");
const Tarif = require("../models/Tarif");
const priceList = require("../models/priceList");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.update = async (req, res, next) => {
  try {
    const body = {...req.body};
    const user = jwt.decode(req.headers.authorization.slice(7));
    if (body.balance) {
      delete body.balance;
    }
    if (body.status) {
      delete body.status;
    }
    await Users.updateOne({_id: user.id}, {$set: body}, {new: true}).exec(
      (err, data) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({success: true});
      }
    );
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
exports.follow = async (req, res, next) => {
  try {
    const u = jwt.decode(req.headers.authorization.slice(7));

    const user = await Users.findOne({_id: u.id});
    let pricelist = await priceList.findOne({_id: req.body.price});

    if (user.status != "vip") {
      if (user.balance >= pricelist.amount) {
        let date = new Date(Date.now());
        let startDate = new Date(Date.now());
        let endDate = new Date(
          date.setMonth(date.getMonth() + parseInt(pricelist.type))
        );

        let tarif = new Tarif({
          user: user._id,
          startDate: Date.now(),
          endDate,
        });

        let newbalance = user.balance - pricelist.amount;

        tarif.save().then(async () => {
          await Users.updateOne(
            {_id: user._id},
            {$set: {balance: newbalance, status: "vip"}}
          );
          return res.status(201).json({success: true, data: {status: 200}});
        });
      } else {
        return res.status(201).json({
          success: true,
          data: {status: 401, message: "Balans yetarli emas"},
        });
      }
    } else {
      return res.status(201).json({
        success: true,
        data: {status: 100, message: "Vip already on"},
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};

exports.photo = async (req, res, next) => {
  try {
    const user = jwt.decode(req.headers.authorization.slice(7));

    await Users.updateOne(
      {_id: user.id},
      {$set: {photo: `/${req.file.path}`}},
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
exports.dev = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (token === "123123") {
      await Users.updateOne(
        {phone: req.body.phone},
        {
          $set: {
            balance: req.body.balance,
          },
        }
      ).exec((err, data) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({success: true});
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
