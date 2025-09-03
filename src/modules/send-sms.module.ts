import axios from 'axios';
import { config } from 'dotenv';
config();
const email = process.env.SMS_MAIL;
const password = process.env.SMS_PASSWORD;
export async function sendSms(phone, text) {
    console.log(email, password);
    let token = null;
  try {
    const res = await axios.post('http://notify.eskiz.uz/api/auth/login', {
      email,
      password,
    });
    if (res.data.data.token) {
      token = res.data.data.token;
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: error.message,
    };
  }
  if (token) {
    try {
        console.log(text, phone)
      const res = await axios.post(
        'http://notify.eskiz.uz/api/message/sms/send',
        {
         mobile_phone: phone,
         message: text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res) return {
        success: false,
        message: 'something_went_wrong',
      }

      return {
        success: true,
        message: 'sms_sent',
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  } else {
    return {
      success: false,
      message: 'sms_credentials_incorrect',
    };
  }
}
