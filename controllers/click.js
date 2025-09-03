const Auths = require("../models/auth");
const md5 = require("md5");
const crypto = require("crypto");
const ClickTransaction = require("../models/click");
const Journal = require("../models/journal");
const sendNotification = require("../utils/userNotification");

exports.clickPrepare = async (req, res, next) => {
  try {
    console.log("click======", req.body);
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      amount,
      action,
      error,
      sign_time,
      sign_string,
    } = req.body;
    const client = await Auths.findOne({uid: req.body.merchant_trans_id});
    const signature = `${click_trans_id}${service_id}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`;
    const check_signat = md5(signature) === sign_string;
    const time = new Date().getTime();
    console.log(req.body.click_trans_id);
    if (action !== "0") {
      console.log({
        error: "-3",
        error_note: "Запрашиваемое действие не найдено",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: "-3",
          error_note: "Запрашиваемое действие не найдено",
        });
    }
    // if (!check_signat) {
    //     return res.set({ "headers": { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" } }).send({
    //         error: -1,
    //         error_note: 'Ошибка проверки подписи'
    //     })
    // }
    if (!client) {
      console.log({
        error: -5,
        error_note: "Заказ не найден",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -5,
          error_note: "Заказ не найден",
        });
    }
    if (parseInt(amount) < 1000) {
      console.log({
        error: -2,
        error_note: "Неверная сумма оплаты",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -2,
          error_note: "Неверная сумма оплаты",
        });
    }
    const newTransaction = await ClickTransaction.create({
      click_transaction_id: click_trans_id,
      order: parseInt(merchant_trans_id),
      state: "1",
      status: "waiting",
      create: time,
      merchant_prepare_id: Math.floor(Math.random() * 1000000000).toString(),
      amount,
      click_prepare_confirm: time,
    });
    return res
      .set({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      })
      .send({
        click_trans_id: newTransaction.click_transaction_id,
        merchant_trans_id: newTransaction.client,
        merchant_prepare_id: newTransaction.merchant_prepare_id,
        error: 0,
        error_note: "Success",
      });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
// @desc      Endpoint for Click
// @route     POST /api/v1/transaction/click/complete
// @access    Public
exports.clickComplete = async (req, res, next) => {
  try {
    // console.log(req.body);
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      merchant_prepare_id,
      amount,
      action,
      error,
      sign_time,
      sign_string,
    } = req.body;
    const client = await Auths.findOne({uid: merchant_trans_id});
    const transaction = await ClickTransaction.findOne({
      merchant_prepare_id: merchant_prepare_id,
    });
    const signature = `${click_trans_id}${service_id}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`;
    const check_signat = md5(signature) === sign_string;
    console.log(transaction);
    if (!transaction) {
      console.log({
        error: -6,
        error_note: "Не найдена транзакция",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -6,
          error_note: "Не найдена транзакция",
        });
    }
    if (transaction.status === "payed") {
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          click_trans_id: req.body.click_trans_id,
          merchant_trans_id: transaction.order,
          merchant_confirm_id: transaction.click_prepare_confirm,
          error: 0,
          error_note: "Success",
        });
    }
    if (transaction.state === "2") {
      console.log({
        error: -4,
        error_note: "Транзакция ранее была подтверждена",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -4,
          error_note: "Транзакция ранее была подтверждена",
        });
    }
    console.log(req.body);
    if (action !== "1") {
      console.log({
        error: -3,
        error_note: "Запрашиваемое действие не найдено",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -3,
          error_note: "Запрашиваемое действие не найдено",
        });
    }

    // if (!check_signat) {
    //     console.log({
    //         error: -1,
    //         error_note: 'Ошибка проверки подписи'
    //     })
    //     return res.set({ "headers": { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" } }).send({
    //         error: -1,
    //         error_note: 'Ошибка проверки подписи'
    //     })
    // }

    if (parseInt(amount) < 1000) {
      console.log({
        error: -2,
        error_note: "Неверная сумма оплаты",
      });
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -2,
          error_note: "Неверная сумма оплаты",
        });
    }

    if (error === "-5017") {
      await ClickTransaction.updateOne(
        {_id: transaction._id},
        {
          $set: {
            state: "-2",
            status: "canceled",
          },
        }
      );
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -9,
          error_note: "Нехватка средств",
        });
    }

    if (transaction.state === "-2") {
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          error: -9,
          error_note: "Транзакция ранее была отменена",
        });
    }

    if (error === "0") {
      const journal = new Journal({
        driver: client._id,
        amount: transaction.amount,
        system: "click",
      });
      journal.save();

      let newBalance = client.balance + transaction.amount;

      await Auths.updateOne(
        {_id: client._id},
        {
          $set: {
            balance: newBalance,
          },
        }
      );
      sendNotification(client._id, transaction.amount);
      await ClickTransaction.updateOne(
        {_id: transaction._id},
        {
          $set: {
            state: "2",
            perform: new Date(),
            status: "payed",
          },
        }
      );
      return res
        .set({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .send({
          click_trans_id: transaction.click_transaction_id,
          merchant_trans_id: transaction.client,
          merchant_confirm_id: transaction.click_prepare_confirm,
          error: 0,
          error_note: "Success",
        });
    }
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
};
