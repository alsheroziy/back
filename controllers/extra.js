const Version = require("../models/appVersion");
const asyncHandler = require("../middlewares/async");
const Logs = require("../models/requestLog");
const axios = require("axios");
exports.createVersion = asyncHandler(async(req, res) => {

    try {
        const version = new Version(req.body);
        version
            .save()
            .then(() => {
                res.status(201).json({
                    success: true,
                });
            })
            .catch((error) => {
                res.send(error).json({
                    success: false,
                    error,
                });
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.getVersion = asyncHandler(async(req, res) => {

    try {
        const version = await Version.findOne({ appName: req.params.name });

        res.status(201).json({
            success: true,
            data: version,
        });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.updateVersion = asyncHandler(async(req, res) => {

    try {
        Version.findOneAndUpdate({ appName: req.params.name }, { $set: { version: req.body.version, isRequired: req.body.isRequired } })
            .then(() => {
                res.status(200).json({
                    success: true,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    success: false,
                });
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});
exports.deleteVersion = asyncHandler(async(req, res) => {

    try {
        Version.findOneAndDelete({ appName: req.params.name })
            .then(() => {
                res.status(200).json({
                    success: true,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    success: false,
                });
            });
    } catch {
        return res.status(500).json({ status: false })
    }

});


exports.namoz = asyncHandler(async(req, res) => {

    try {
        let lat = req.body.lat;
        let long = req.body.long;

        let dateNow = new Date(Date.now());

        let year = dateNow.getFullYear()
        let month = dateNow.getMonth() + 1
        let day = dateNow.getDate()
        let hour = dateNow.getHours()
        let minute = dateNow.getMinutes()



        let prayersData = await axios.get(`https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${long}&method=0&month=${month}&year=${year}`)
        let list = prayersData.data.data

        let findOneDay = list.find(item => parseInt(item.date.gregorian.day) == day)


        res.status(200).json({
            success: true,
            data: findOneDay.timings
        });
    } catch {
        return res.status(500).json({ status: false })
    }



});
exports.getLogs = asyncHandler(async(req, res) => {

    try {
        const count = await Logs.countDocuments()
        const logs = await Logs.find()
            .sort({ createdAt: -1 })
            .skip((req.query.page - 1) * 20)
            .limit(20)
        res.status(200).json({ success: true, count, data: logs });
    } catch {
        return res.status(500).json({ status: false })
    }
});