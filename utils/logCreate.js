const requestLog = require("../models/requestLog");

async function saveLog(type, body) {
    let newLog = new requestLog({
        type,
        body
    })
    newLog.save().then(() => {
        return true
    }).catch(err => {
        return false
    })
};

module.exports = saveLog;