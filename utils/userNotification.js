const axios = require("axios");

function sendNotification(userId, amount) {
    axios({
        method: "POST",
        url: "https://fcm.googleapis.com/fcm/send",
        headers: {
            Authorization: "key=AAAAHS3fn2U:APA91bH3WSCDM6Al5rtvGEtIUygQayJL36juLtJNZO1xs8Wf8_NeTUNGN3YuNmLCeuE3Glt4ZiRi5M4DRpOT5WIVMLAj3lDbLmZfsB7-Xmsd6FmBWVVJ3wcaqrRKaEU8Z2ZjZG-O9J_J",
            'Content-Type': "application/json"
        },
        data: {
            "to": `/topics/${userId}`, //user id
            "notification": {
                "title": "Hisob to'ldirildi",
                "body": `Hisobingiz ${amount} so'mga to'ldirildi`,
                "sound": "default"
            },
            "data": {
                "click_action": "FLUTTER_NOTIFICATION_CLICK",
                "page": "Tariff",
                "status": true,
                "id": "d9791a95-5270-4125-85de-06f322486e1d" //tariff id
            },
            "priority": "high"
        },
    }).then((response) => {

    }).catch(err => {
        console.log(err)
    })
}
module.exports = sendNotification;