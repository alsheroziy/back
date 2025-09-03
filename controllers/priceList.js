const priceList = require('../models/priceList')

exports.addPrices = async(req, res) => {

    try {
        const list = new priceList({
            name: req.body.name,
            amount: req.body.amount,
            type: req.body.type,
            //date: req.body.date
        })
        await list.save()
            .then(() => {
                res.status(201).json({
                    success: true,
                    data: list
                })
            })
            .catch((error) => {
                res.status(400).json({
                    success: false,
                    data: error
                })
            })
    } catch {
        return res.status(500).json({
            status: false
        })
    }

}
exports.getPrices = async(req, res) => {
    try {
        const list = await priceList.find()
            .sort({ date: -1 })
        if (!list) {
            res.status(404).json({
                success: false,
                data: 'List Not Found'
            })
        }
        res.status(200).json({ success: true, data: list })
    } catch {
        return res.status(500).json({
            status: false
        })
    }

}
exports.getById = async(req, res) => {
    try {
        await priceList.findOne({ _id: req.params.id }, (err, data) => {
            if (err) return res.status(400).json({ success: false, err })
            return res.status(200).json({ sucess: true, data })
        })
    } catch {
        return res.status(500).json({
            status: false
        })
    }

}
exports.updatePrices = async(req, res) => {
    try {
        const list = await priceList.findByIdAndUpdate({ _id: req.params.id });
        if (!list) {
            res.status(404).json({
                success: false,
                data: 'List Not Found'
            })
        }

        list.name = req.body.name
        list.amount = req.body.amount
        list.type = req.body.type
            //list.date = req.body.date

        await list.save()
            .then(() => {
                res.status(200).json({
                    success: true,
                    data: list
                })
            })
            .catch((error) => {
                res.send(error)
            })
    } catch {
        return res.status(500).json({
            status: false
        })
    }



}
exports.deletePrice = async(req, res) => {
    try {
        await priceList.deleteOne({ _id: req.params.id }, (err, data) => {
            if (err) return res.status(400).json({ success: false, err })
            return res.status(200).json({ sucess: true })
        })
    } catch {
        return res.status(500).json({
            status: false
        })
    }

}