const Driver = require("../models/auth");
const Journal = require("../models/journal");

exports.create = async(req, res) => {

    try {
        let body = req.body;

        let user = await Driver.findOne({ uid: body.uid });
        let balance = user.balance;

        let journal = new Journal({
            system: body.system,
            amount: body.amount,
            driver: user._id,
        });
        journal.save();

        let balanceSum = balance + body.amount;

        await Driver.updateOne({ _id: user._id }, { $set: { balance: balanceSum } },
            (err, data) => {
                if (err) return res.status(400).json({ success: false });
                return res.status(200).json({ success: true });
            }
        );
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};

exports.paylist = async(req, res) => {
    try {
        const count = await Journal.countDocuments();

        const list = await Journal.find()
            .sort({ createdAt: -1 })
            .skip((req.query.page - 1) * 20)
            .limit(20)
            .populate("driver");
        res.status(200).json({ success: true, count, data: list });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};
exports.UserLastTrans = async(req, res) => {
    try {
        let user = await Driver.findOne({ uid: req.params.id });

        const data = await Journal.findOne({ driver: user._id })
            .sort({
                createdAt: -1,
            })
            .populate({
                path: "driver",
                select: ["name", "balance"],
            });
        res.status(200).json({ success: true, data });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};