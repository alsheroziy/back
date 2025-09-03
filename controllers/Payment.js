const User = require("../models/auth");
const Jurnal = require("../models/jurnal");
const Journal = require("../models/journal");
const crypto = require("crypto");
const Transaction = require("../models/Transaction");
const sendNotification = require("../utils/userNotification");
const base64 = require("base-64");
const axios = require("axios");
const JWT = require("jsonwebtoken");
const saveLog = require("../utils/logCreate");
//const JWT = require('jsonwebtoken')
exports.checkTransaction = async (req, res) => {
  try {
    const transaction = await Jurnal.findOne({_id: req.params.id});
    if (!transaction) {
      return res.status(404).json({
        success: false,
        state: -1,
      });
    } else {
      const candidate = await User.findOne({_id: transaction.userID});

      return res.status(200).json({
        success: true,
        state: 1,
      });
    }
  } catch (e) {
    res.status(400).json({
      success: false,
      data: e,
    });
  }
};
exports.appLinkOson = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = JWT.decode(token.slice(7));
    const candidate = await User.findOne({_id: user.id}).select({
      password: 0,
    });

    let jurnal = new Jurnal({
      userID: candidate._id,
      date: Date.now(),
      type: "oson",
      amount: req.body.amount,
      status: false,
    });

    jurnal
      .save()
      .then(async () => {
        axios({
          method: "POST",
          url: "https://api.oson.uz/api/invoice/create",
          headers: {
            token: "9TUX4gfEPUIkWjx46Dvn9DDEb3jm6x55gPTbVYFAIdKul7ni",
          },
          data: {
            merchant_id: 2040,
            transaction_id: jurnal._id,
            phone: "",
            user_account: candidate.uid,
            amount: req.body.amount,
            currency: "UZS",
            comment: `Оплата заказа ${jurnal._id}`,
            return_url: "http://amediatv.uz/",
            lifetime: 30,
            lang: "ru",
          },
        })
          .then((response) => {
            return res.status(200).json({
              success: true,
              data: {
                pay_url: response.data.pay_url,
                user_account: candidate.uid,
                tra_id: jurnal._id,
              },
            });
          })
          .catch((err) => {
            console.error(err);
            return res.status(404).json({
              success: false,
            });
          });
      })
      .catch((err) => {
        return res.status(404).json({
          success: false,
          data: err,
        });
      });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
exports.checkUser = async (req, res) => {
  try {
    const user = await User.findOne({uid: req.params.id});
    if (!user) {
      return res.status(404).json({
        success: false,
      });
    } else {
      return res.status(200).json({
        success: true,
        data: user,
      });
    }
  } catch (e) {
    res.status(400).json({
      success: false,
      data: e,
    });
  }
};
exports.saveData = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (
      token ==
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmZGRiMjJlZThlOTgwNTc4ODZlMWNjNiIsImlhdCI6MTY0Njk5NjI5NywiZXhwIjoxNjQ5NTg4Mjk3fQ.FXuo8uX_vay8HTXEFVEdGtcu5ExzSblza1I4LtYqLaA"
    ) {
      const candidate = await User.findOne({uid: req.body.userID});
      //console.log(candidate)
      const journal = new Journal({
        driver: candidate._id,
        amount: req.body.amount / 100,
        system: req.body.type,
      });

      await journal
        .save()
        .then(async () => {
          const sum = req.body.amount;
          const dt = {
            balance: parseInt(candidate.balance) + parseInt(sum) / 100,
          };
          await User.updateOne({_id: candidate._id}, {$set: dt}).exec(() => {
            sendNotification(candidate._id, parseInt(sum) / 100);
            res.status(201).json({
              success: true,
              data: journal,
            });
          });
        })
        .catch((error) => {
          //      console.log(error)
          return res.status(400).json({
            success: false,
            data: error,
          });
        });
    } else {
      return res.status(400).json({
        success: false,
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};

exports.Events = async (req, res) => {
  try {
    const count = await Journal.countDocuments();
    const journal = await Journal.find()
      .populate(["userID"])
      .skip((req.query.page - 1) * 20)
      .limit(20)
      .sort({date: -1});
    res.status(200).json({
      success: true,
      count,
      data: journal,
    });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};

// s
exports.payOsonAppLink = async (req, res) => {
  try {
    const transaction_id = req.body.transaction_id;
    const transaction = await Jurnal.findOne({_id: transaction_id});
    const parameters = `${transaction_id}:${req.body.bill_id}:${req.body.status}`;
    const sha1 = crypto
      .createHash("sha256")
      .update(`9TUX4gfEPUIkWjx46Dvn9DDEb3jm6x55gPTbVYFAIdKul7ni:2040`)
      .digest("hex");

    const signature = crypto
      .createHash("sha256")
      .update(`${sha1}:${parameters}`)
      .digest("hex");

    if (signature === req.body.signature && req.body.status == "PAID") {
      console.log("transaction", transaction);

      const candidate = await User.findOne({_id: transaction.userID});
      console.log("candidate", candidate);
      const oson = new Journal({
        driver: candidate._id,
        amount: transaction.amount,
        system: "oson",
      });

      oson
        .save()
        .then(async () => {
          let newbalance = candidate.balance + transaction.amount;
          User.findOneAndUpdate(
            {_id: candidate._id},
            {$set: {balance: newbalance}}
          )
            .then(() => {
              sendNotification(candidate._id, transaction.amount);
              console.log("oson", oson);
              res.status(201).json({
                state: 1,
                transaction_id: oson._id,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                success: false,
                message: "Something went wrong",
              });
            });
        })
        .catch((error) => {
          res.status(400).json({
            success: false,
            state: 0,
            data: error,
          });
        });
    } else {
      res.status(400).json({
        success: false,
        state: 0,
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
exports.checkOson = async (req, res) => {
  const token = "AXBFbyL5s7L5FKAYYZnVvKx6vuad2CKsrbWckj7ngHhMhun7jA";
  try {
    if (req.headers.token === token) {
      if (req.body.method === "check") {
        const user = await User.findOne({uid: req.body.account});
        if (!user) {
          res.status(404).json({
            success: false,
            data: "User not found",
          });
        } else {
          res.status(200).json({
            success: true,
            user,
          });
        }
      } else {
        res.status(400).json({
          status: false,
          data: "Invalid method",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        data: "Invalid token",
      });
    }
  } catch (e) {
    res.status(400).json({
      success: false,
      data: e,
    });
  }
};
exports.payOson = async (req, res) => {
  const token = "AXBFbyL5s7L5FKAYYZnVvKx6vuad2CKsrbWckj7ngHhMhun7jA";
  const token2 = "9TUX4gfEPUIkWjx46Dvn9DDEb3jm6x55gPTbVYFAIdKul7ni";

  try {
    if (req.headers.token === token || req.headers.token === token2) {
      if (req.body.method === "pay") {
        const candidate = await User.findOne({uid: req.body.account});
        const oson = new Journal({
          driver: candidate._id,
          amount: req.body.amount,
          system: "oson",
        });

        oson
          .save()
          .then(async () => {
            let newbalance = candidate.balance + req.body.amount;
            User.findOneAndUpdate(
              {_id: candidate._id},
              {$set: {balance: newbalance}}
            )
              .then(() => {
                sendNotification(candidate._id, req.body.amount);
                res.status(201).json({
                  state: 1,
                  transaction_id: oson._id,
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  success: false,
                  message: "Something went wrong",
                });
              });
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              state: 0,
              data: error,
            });
          });
      } else {
        res.status(400).json({
          status: false,
          data: "Invalid method",
        });
      }
    } else {
      res.status(400).json({
        success: false,
        data: "Invalid token",
      });
    }
  } catch (e) {
    res.send(e);
  }
};

exports.PaymeUrl = async (req, res) => {
  try {
    const amount = req.body.amount;

    const user = await User.findById({_id: req.body.user});

    let base = base64.encode(
      `m=5fd067551c849a7578ddf061;ac.user=${user.uid};a=${amount};c=https://amediatv.uz/profile`
    );
    let url = "https://checkout.paycom.uz/" + base;

    res.status(200).json({success: true, url});
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};

// aplesin

exports.checkApelsin = async (req, res) => {
  try {
    let userId = req.body.cabinetId;

    let user = await User.findOne({uid: userId});

    if (user) {
      res.status(200).json({
        status: true,
        error: null,
        data: {
          full_name: user.name,
          created_at: user.createdAt,
          cabinetId: user.uid,
          amount: user.balance * 100,
        },
      });
    } else {
      res.status(200).json({
        status: false,
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
exports.payApelsin = async (req, res) => {
  try {
    let body = req.body;
    let candidate = await User.findOne({uid: body.cabinetId});

    let trOld = await Transaction.findOne({
      transaction: req.body.transactionId,
    });
    if (candidate && !trOld) {
      const apelsin = new Journal({
        driver: candidate._id,
        amount: body.amount / 100,
        system: "apelsin",
      });

      apelsin
        .save()
        .then(async () => {
          let newbalance = candidate.balance + body.amount / 100;
          User.findOneAndUpdate(
            {_id: candidate._id},
            {$set: {balance: newbalance}}
          )
            .then(() => {
              sendNotification(candidate._id, body.amount / 100);
              let transaction = new Transaction({
                driver: candidate.uid,
                transaction: req.body.transactionId,
              });

              transaction
                .save()
                .then(() => {
                  res.status(201).json({
                    status: true,
                  });
                })
                .catch((err) => {
                  res.status(400).json({
                    status: false,
                  });
                });
            })
            .catch((err) => {
              res.status(500).json({
                status: false,
              });
            });
        })
        .catch((error) => {
          res.status(400).json({
            status: false,
          });
        });
    } else {
      res.status(200).json({
        status: false,
      });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
