const Balance = require("../models/balance");
const PriceList = require("../models/priceList");
const User = require("../models/auth");
const jwt = require("jsonwebtoken");

exports.addBalance = async(req, res, next) => {

    try {
        const token = req.headers.authorization;
        const user = jwt.decode(token.slice(7, token.length));

        const price = req.body.price;

        let priceList = await PriceList.findById({ _id: price });
        const today = new Date();
        let endDate;
        let ress;
        // 12-2-20201
        switch (priceList.type) {
            case "1":
                ress = new Date(today.getTime() + 1 * 31 * 24 * 60 * 60 * 1000);
                endDate = `${ress.getDate()}-${
                ress.getMonth() + 1
            }-${ress.getFullYear()}`;
                break;
            case "3":
                ress = new Date(today.getTime() + 3 * 31 * 24 * 60 * 60 * 1000);
                endDate = `${ress.getDate()}-${
                ress.getMonth() + 1
            }-${ress.getFullYear()}`;
                break;
            case "6":
                ress = new Date(today.getTime() + 6 * 30.4 * 24 * 60 * 60 * 1000);
                endDate = `${ress.getDate()}-${
                ress.getMonth() + 1
            }-${ress.getFullYear()}`;
                break;
            case "10":
                ress = new Date(today.getTime() + 12 * 30.4 * 24 * 60 * 60 * 1000);
                endDate = `${ress.getDate()}-${
                ress.getMonth() + 1
            }-${ress.getFullYear()}`;
                break;
        }
        const candidate = await User.findById({ _id: user.id });
        if (!priceList) {
            return res.send("Bunday tarif mavjud emas");
        } else {
            if (candidate.balance > 0 && candidate.balance >= priceList.amount) {
                const balanseJournal = new Balance({
                    user: user.id,
                    price: price,
                    endDate: endDate,
                    status: true,
                });
                balanseJournal
                    .save()
                    .then(() => {
                        res.status(201).json({
                            success: true,
                            data: balanseJournal,
                        });
                    })
                    .catch((error) => {
                        res.status(400).json({
                            success: false,
                            error: error,
                        });
                    });
            } else {
                res.status(402).json({
                    status: false,
                    data: "Mablag` yetarli emas",
                });
            }
        }
    } catch {
        return res.status(500).json({ status: false })
    }
};

exports.getBalances = async(req, res, next) => {


    try {
        const balanseJournal = await Balance.find()
            .populate(["user", "price"])
            .sort({ date: -1 });
        res.status(200).json({
            success: true,
            data: balanseJournal,
        });
    } catch {
        return res.status(500).json({ status: false })
    }

};