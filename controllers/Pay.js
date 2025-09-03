const { RPCErrors } = require("../utils/RPCErrors");
const { BillingErrors } = require("../utils/BillingErrors");
const Driver = require("../models/auth");
const Transaction = require("../models/Transaction");
const Journal = require("../models/journal");
const sendNotification = require("../utils/userNotification");
exports.payme = async(req, res) => {

    try {
        // const PAYCOM_PASSWORD = "6@rnfOBMcmIW0ErMqg3%kAArh?YqUd0GGmr?"; // test
        const PAYCOM_PASSWORD = "5mx%kMXEk0Q5MEsJiuuZ9oZWbKReSI9y4Xh4";

        if (req.method !== "POST") {
            return sendResponse(RPCErrors.TransportError(), null);
        }
        //проверяем автssоризацию запроса.
        if (!checkAuth(req.headers["authorization"])) {
            //если запрос авторизован возвращаем ошибку -32504
            return sendResponse(RPCErrors.AccessDeniet(), null);
        }
        const data = req.body;
        const params = req.body.params;

        switch (data.method) {
            case "CheckPerformTransaction":
                {
                    return CheckPerformTransaction(
                        params.account.user,
                        params.amount
                    );
                }
                break;
            case "CreateTransaction":
                {
                    return CreateTransaction(params);
                }
                break;
            case "PerformTransaction":
                {
                    return PerformTransaction(params);
                }
                break;
            case "CheckTransaction":
                {
                    return CheckTransaction(params);
                }
                break;
            case "CancelTransaction":
                {
                    return CancelTransaction(params);
                }

                break;
        }

        async function CheckPerformTransaction(id, amount) {
            await Driver.findOne({ uid: id }, (err, data) => {
                if (err || !data)
                    return sendResponse(BillingErrors.DriverNotFound(), null);
                if (amount / 100 <= 1000)
                    return sendResponse(BillingErrors.IncorrectAmount(), null);
                return sendResponse(null, {
                    allow: true,
                });
            });
        }
        async function CreateTransaction(param) {
            console.log("createtrIN---------asdasd");

            await Transaction.findOne({ tid: param.id }, async(err, data) => {
                if (!data) {
                    await Driver.findOne({ uid: param.account.user },
                        async(err, driver) => {
                            if (err || !driver)
                                return sendResponse(
                                    BillingErrors.DriverNotFound(),
                                    null
                                );

                            if (param.amount / 100 <= 1000)
                                return sendResponse(
                                    BillingErrors.IncorrectAmount(),
                                    null
                                );
                        }
                    );
                    const transaction = new Transaction({
                        tid: param.id,
                        transaction: Math.floor(
                            Math.random() * 1000000000
                        ).toString(),
                        amount: param.amount / 100,
                        state: 1,
                        perform_time: 0,
                        cancel_time: 0,
                        create_time: Date.now(),
                        driver: parseInt(param.account.user),
                        time: param.time,
                    });
                    transaction
                        .save()
                        .then(() => {
                            return sendResponse(null, {
                                transaction: transaction.transaction,
                                state: transaction.state,
                                create_time: transaction.create_time,
                                perform_time: transaction.perform_time,
                                cancel_time: transaction.cancel_time,
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
                if (data) {
                    if (param.id !== data.tid) {
                        return sendResponse(BillingErrors.YesTransaction(), null);
                    }
                    if (data.state === 1) {
                        if (data.time > param.time) {
                            await Transaction.updateOne({ tid: param.id }, {
                                    $set: {
                                        state: -1,
                                        reason: 4,
                                    },
                                },
                                (err, data) => {
                                    return sendResponse(
                                        BillingErrors.UnexpectedTransactionState(),
                                        null
                                    );
                                }
                            );
                        } else {
                            return sendResponse(null, {
                                state: data.state,
                                create_time: data.create_time,
                                transaction: data.transaction,
                                perform_time: data.perform_time || 0,
                                cancel_time: data.cancel_time || 0,
                            });
                        }
                    } else {
                        return sendResponse(
                            BillingErrors.UnexpectedTransactionState(),
                            null
                        );
                    }
                }
            });
        }

        async function PerformTransaction(param) {
            await Transaction.findOne({ tid: param.id },
                async(err, transaction) => {
                    if (!transaction)
                        return sendResponse(
                            BillingErrors.TransactionNotFound(),
                            null
                        );
                    if (transaction.state === 1) {
                        if (transaction.time > Date.now()) {
                            await Transaction.updateOne({ tid: param.id }, {
                                $set: {
                                    state: -1,
                                    reason: 4,
                                },
                            });

                            return sendResponse(
                                BillingErrors.UnexpectedTransactionState(),
                                null
                            );
                        } else {
                            const driver = await Driver.findOne({
                                uid: transaction.driver,
                            });
                            const journal = new Journal({
                                system: "payme",
                                amount: transaction.amount,
                                driver: driver._id,
                            });
                            await journal.save();

                            let allbalance = driver.balance + transaction.amount;
                            await Driver.updateOne({ uid: transaction.driver }, {
                                $set: {
                                    balance: allbalance,
                                },
                            });
                            sendNotification(driver._id, transaction.amount)
                            await Transaction.updateOne({ tid: transaction.tid }, {
                                $set: {
                                    state: 2,
                                    perform_time: Date.now(),
                                },
                            });
                            const tt = await Transaction.findOne({
                                tid: transaction.tid,
                            });
                            return sendResponse(null, {
                                transaction: transaction.transaction,
                                perform_time: tt.perform_time,
                                state: 2,
                            });
                        }
                    }
                    if (transaction.state === 2) {
                        return sendResponse(null, {
                            transaction: transaction.transaction,
                            perform_time: transaction.perform_time,
                            state: transaction.state,
                        });
                    } else {
                        return sendResponse(
                            BillingErrors.UnexpectedTransactionState(),
                            null
                        );
                    }
                }
            );
        }
        async function CancelTransaction(param) {
            await Transaction.findOne({ tid: param.id },
                async(err, transaction) => {
                    if (err || !transaction)
                        return sendResponse(
                            BillingErrors.TransactionNotFound(),
                            null
                        );
                    if (transaction.state === 1) {
                        await Transaction.updateOne({ tid: transaction.tid }, {
                            $set: {
                                state: -1,
                                reason: param.reason,
                                cancel_time: Date.now(),
                            },
                        });
                        await Transaction.findOne({ tid: transaction.tid },

                            async(err, data) => {
                                if (err) return sendResponse(err, null);
                                const dr = await Driver.find({
                                    uid: transaction.driver,
                                });
                                await Journal.findOneAndDelete({ driver: dr.uid },
                                    (err, data) => {
                                        if (err) return sendResponse(err, null);
                                    }
                                );

                                return sendResponse(null, {
                                    state: data.state,
                                    cancel_time: data.cancel_time,
                                    transaction: data.transaction,
                                    create_time: data.create_time,
                                    perform_time: data.perform_time || 0,
                                });
                            }
                        );
                    } else {
                        if (transaction.state === 2) {
                            await Driver.findOne({ uid: transaction.driver },
                                async(err, driver) => {
                                    if (err) return sendResponse(err, null);

                                    if (driver.balance >= transaction.amount) {
                                        let newbalance =
                                            driver.balance - transaction.amount;
                                        await Driver.updateOne({ uid: transaction.driver }, {
                                            $set: {
                                                balance: newbalance,
                                            },
                                        });

                                        await Transaction.updateOne({ tid: transaction.tid }, {
                                            $set: {
                                                state: -2,
                                                reason: param.reason,
                                                cancel_time: Date.now(),
                                            },
                                        }).exec(async(err, transac) => {
                                            if (err) return sendResponse(err, null);

                                            if (transac) {
                                                await Transaction.findOne({ tid: transaction.tid },
                                                    async(err, tr) => {
                                                        if (err)
                                                            return sendResponse(
                                                                err,
                                                                null
                                                            );

                                                        if (tr) {
                                                            return sendResponse(
                                                                null, {
                                                                    state: tr.state,
                                                                    cancel_time: tr.cancel_time ||
                                                                        0,
                                                                    transaction: tr.transaction,
                                                                    create_time: tr.create_time,
                                                                    perform_time: tr.perform_time ||
                                                                        0,
                                                                }
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    } else {
                                        await Transaction.updateOne({ tid: transaction.tid }, {
                                            $set: {
                                                state: -2,
                                                reason: param.reason,
                                                cancel_time: Date.now(),
                                            },
                                        }).exec(async(err, transac) => {
                                            if (err) return sendResponse(err, null);

                                            if (transac) {
                                                await Transaction.findOne({ tid: transaction.tid },
                                                    async(err, tr) => {
                                                        if (err)
                                                            return sendResponse(
                                                                err,
                                                                null
                                                            );

                                                        if (tr) {
                                                            return sendResponse(
                                                                null, {
                                                                    state: tr.state,
                                                                    cancel_time: tr.cancel_time ||
                                                                        0,
                                                                    transaction: tr.transaction,
                                                                    create_time: tr.create_time,
                                                                    perform_time: tr.perform_time ||
                                                                        0,
                                                                }
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        });
                                    }
                                }
                            );
                        } else {
                            return sendResponse(null, {
                                state: transaction.state,
                                cancel_time: transaction.cancel_time || 0,
                                transaction: transaction.transaction,
                                create_time: transaction.create_time,
                                perform_time: transaction.perform_time || 0,
                            });
                        }
                    }
                }
            );
        }
        async function CheckTransaction(param) {
            await Transaction.findOne({ tid: param.id }, (err, data) => {
                if (err || !data)
                    return sendResponse(BillingErrors.TransactionNotFound(), null);
                return sendResponse(null, {
                    create_time: data.create_time,
                    perform_time: data.perform_time || 0,
                    cancel_time: data.cancel_time || 0,
                    transaction: data.transaction,
                    state: data.state,
                    reason: data.reason || null,
                });
            });
        }

        function sendResponse(error, result) {
            res.writeHead(200, {
                "Content-Type": "application/json; charset=utf-8",
            });

            res.end(
                JSON.stringify({
                    jsonrpc: "2.0",
                    error: error || undefined,
                    result: result || undefined,
                    id: req.body.id,
                })
            );
        }

        function checkAuth(auth) {
            return (
                auth && //проверяем существование заголовка
                (auth = auth.trim().split(/ +/)) && //разделяем заголовок на 2 части
                auth[0] === "Basic" &&
                auth[1] && //проверяем правильность формата заголовка
                (auth = Buffer.from(auth[1], "base64").toString("utf-8")) && //декодируем из base64
                (auth = auth.trim().split(/ *: */)) && //разделяем заголовок на логин пароль
                auth[0] === "Paycom" && //проверяем логин
                auth[1] === PAYCOM_PASSWORD
            ); //проверяем пароль
        }
    } catch {
        return res.status(500).json({
            status: false
        })
    }
};