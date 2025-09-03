const Payments = require("../models/payment");
//const JWT = require('jsonwebtoken')
exports.create = async(req, res) => {
    try {
        const payments = new Payments(req.body);
        payments
            .save()
            .then(() => {
                res.status(201).json({
                    success: true,
                });
            })
            .catch((error) => {
                res.status(400).json({
                    success: true,
                    data: error,
                });
            });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};
exports.getAdmin = async(req, res, next) => {

    try {
        const count = await Payments.countDocuments();
        const payments = await Payments.find()
            .sort({ createdAt: -1 })
            .skip((req.query.page - 1) * 20)
            .limit(20)


        res.status(200).json({
            success: true,
            count,
            data: payments,
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};

exports.getAll = async(req, res, next) => {

    try {
        const payments = await Payments.find()

        res.status(200).json({
            success: true,
            data: payments,
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};
exports.edit = async(req, res) => {

    try {
        Payments.findOneAndUpdate({ _id: req.params.id }, { $set: req.body })
            .then(() => {
                res.status(200).json({
                    success: true,
                });
            })
            .catch((err) => {
                res.status(400).json({
                    success: false,
                });
            });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};
exports.delete = async(req, res) => {

    try {
        await Payments.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: [],
        });
    } catch {
        return res.status(500).json({
            status: false
        })
    }

};