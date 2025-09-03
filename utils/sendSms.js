const axios = require("axios");
const req = require("express/lib/request");

function SMS(phone, message, country) {
  const data = {
    email: "Aniblauz@gmail.com",
    password: "Ih29oI0QLr53wvHdrHPgqJXjWHzywfOJIvCpG2Ns",
  };

  console.log("CCCCCCCCCCCCCCCCCCC");
  console.log(phone + "----------", message);
  axios({
    method: "POST",
    url: "http://notify.eskiz.uz/api/auth/login",
    data,
  }).then((response) => {
    const text = {
      mobile_phone: phone,
      message: message,
      from: "Amediatv.uz",
    };

    let country_code = country || "UZ";

    if (country_code == "UZ") {
      axios({
        method: "POST",
        url: "http://notify.eskiz.uz/api/message/sms/send",
        headers: {
          Authorization: `Bearer ${response.data.data.token}`,
        },
        data: text,
      })
        .then((resp) => {
          // console.log(true);
        })
        .catch((e) => {
          // console.log(e);
        });
    } else {
      const text2 = {
        mobile_phone: phone,
        message: message,
        unicode: 0,
        country_code: country_code,
      };

      if (phone.charAt(0) != "7") {
        axios({
          method: "POST",
          url: "http://notify.eskiz.uz/api/message/sms/send-global",
          headers: {
            Authorization: `Bearer ${response.data.data.token}`,
          },
          data: text2,
        })
          .then((resp) => {
            // console.log(true);
          })
          .catch((e) => {
            // console.log(e);
          });
      }
    }
  });
}
module.exports = SMS;
