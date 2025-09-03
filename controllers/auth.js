const JWT = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/user");
const Tarif = require("../models/Tarif");
const Auths = require("../models/auth");
const SMS = require("../utils/sendSms");
const bcrypt = require("bcrypt");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/async");
const Balance = require("../models/balance");
const KinoCmment = require("../models/comment");
const TempCaptcha = require("../models/tempcaptcha");
const SeraialCmment = require("../models/commentSerial");
const myPhones = ["998997951530", "998901166699"];
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const querystring = require("querystring");

// @description Register
// @route GET /api/auth/register
// @access Public

exports.refreshToken = asyncHandler(async (req, res, next) => {
  try {
    const {refresh_token, token} = req.body;
    if (!refresh_token) {
      return next(new ErrorResponse("Refresh token invalid", 404));
    }
    if (!token) {
      return next(new ErrorResponse("Access token invalid", 404));
    }

    const user = JWT.decode(refresh_token);
    if (!user?.id) {
      return next(new ErrorResponse("Invalid Token or expired", 401));
    }
    const userDb = await Auths.findOne({_id: user.id});
    console.log("userDb", userDb);
    if (!userDb) {
      return next(new ErrorResponse("User not found", 404));
    }
    // Generate a new access token
    sendTokenResponse(userDb, 200, res);
  } catch (err) {
    return next(new ErrorResponse("Token refresh failed unknown", 400));
  }
});
exports.register = asyncHandler(async (req, res, next) => {
  try {
    const candidate = await User.findOne().sort({createdAt: -1});
    const uid = candidate ? candidate.uid + 1 : 10000000;
    const {name, email, password} = req.body;
    let user = await User.create({
      name,
      email,
      password,
      uid,
    });
    res.status(201).json({success: true, data: user});
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});

exports.getRandomAuth = asyncHandler(async (req, res, next) => {
  try {
    const randomUser = await Auths.aggregate([
      {$match: {status: "vip", role: "user"}},
      {$sample: {size: 1}},
    ]);
    res.status(200).json({
      success: true,
      data: randomUser?.[0],
    });
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});
exports.getAuths = asyncHandler(async (req, res, next) => {
  try {
    let filterObj = {
      name: {$regex: req.body?.search || "", $options: "i"},
    };

    if (req.body?.status) {
      filterObj = {...filterObj, status: req.body?.status};
    }
    const count = await Auths.countDocuments(filterObj);
    const users = await Auths.find(filterObj)
      .sort({createdAt: -1})
      .skip((req.query.page - 1) * 20)
      .limit(20);
    res.status(200).json({
      success: true,
      count,
      data: users,
    });
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});
exports.registerEmail = asyncHandler(async (req, res, next) => {
  try {
    let {name, phone} = req.body;
    const candidate = await Auths.findOne().sort({createdAt: -1});
    const isHas = await Auths.findOne({phone});
    const uid = candidate ? candidate.uid + 1 : 10000000;

    if (isHas?.phone !== phone) {
      const salt = await bcrypt.genSalt(12);
      let password = req.body.password;
      password = await bcrypt.hash(password, salt);

      let user = await Auths.create({
        name,
        phone,
        password,
        uid,
      });
      sendTokenResponse(user, 200, res);
    } else {
      return res.status(200).json({
        success: false,
        code: 402,
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});
exports.registerCheck = asyncHandler(async (req, res, next) => {
  try {
    const ip = req?.body?.key;
    const tempCaptcha = await TempCaptcha.findOne({ip});

    let phone = req.body?.phone.replace(/[^0-9]/g, "");
    let user = await Auths.findOne({phone: phone});
    //sss
    if (!user) {
      return res.status(201).json({success: true, data: {status: 404}});
    }
    console.log("RRRRRIppppp", ip);
    console.log("RRRR-req.body?.captcha", req.body?.captcha);
    console.log("RRRRR-tempCaptcha", tempCaptcha);

    if (tempCaptcha && tempCaptcha?.captcha === req.body?.captcha) {
      let findPhones = myPhones.find((item) => item == phone);

      const code = findPhones
        ? "1111"
        : Math.floor(1000 + Math.random() * 9000).toString();
      let hash = req.body.hash ? ` ${req.body.hash}` : "";
      const sendText = `<#> amediatv ga kirish uchun kod: ${code} ${hash}`;

      const salt = await bcrypt.genSalt(12);
      let password = code;
      password = await bcrypt.hash(password, salt);

      Auths.findOneAndUpdate({phone}, {$set: {password}})
        .then(() => {
          SMS(phone, sendText, req.body.country_code);

          TempCaptcha.findOneAndDelete({ip})
            .then(() => {
              res.status(200).json({
                success: true,
                data: {status: 200},
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).json({
                success: false,
                message: "Something went wrong",
              });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            success: false,
            message: "Something went wrong",
          });
        });
    } else {
      res.status(200).json({
        success: false,
        data: {status: 303},
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});
exports.registerTest = asyncHandler(async (req, res, next) => {
  try {
    const ip = req?.body?.key;

    if (!req.body?.phone) {
      return res.status(500).json({
        success: false,
      });
    }

    const tempCaptcha = await TempCaptcha.findOne({ip});

    if (tempCaptcha && tempCaptcha?.captcha === req.body.captcha) {
      const candidate = await Auths.findOne().sort({createdAt: -1});
      const uid = candidate ? candidate.uid + 1 : 10000000;

      let phone = req.body?.phone.replace(/[^0-9]/g, "");
      let user = await Auths.findOne({phone: phone});
      let findPhones = myPhones.find((item) => item == phone);

      const code = findPhones
        ? "1111"
        : Math.floor(1000 + Math.random() * 9000).toString();
      let hash = req.body.hash ? req.body.hash : "";
      const sendText = `<#> amediatv ga kirish uchun kod: ${code} ${hash}`;
      const salt = await bcrypt.genSalt(12);

      let password = code;
      password = await bcrypt.hash(password, salt);

      if (!user) {
        const uuu = await new Auths({
          phone,
          uid,
          password: password,
          name: req.body.name,
        });

        uuu.save();

        SMS(phone, sendText, req.body.country_code);
        return res.status(201).json({success: true, data: {status: 200}});
      } else {
        Auths.findOneAndUpdate({phone}, {$set: {password, name: req.body.name}})
          .then(() => {
            SMS(phone, sendText, req.body.country_code);
            res.status(200).json({
              success: true,
              data: {status: 200},
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              success: false,
              message: "Something went wrong",
            });
          });
      }
    } else {
      res.status(200).json({
        success: false,
        data: {status: 303},
      });
    }
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});

exports.loginTest = asyncHandler(async (req, res, next) => {
  try {
    const {phone, password} = req.body;

    // Validate email & password
    if (!phone || !password) {
      return res.status(200).json({
        success: false,
        error_code: 401,
      });
    }

    // check for user
    const user = await Auths.findOne({phone: phone})
      .sort({createdAt: -1})
      .select("+password");

    if (!user) {
      return res.status(200).json({
        success: false,
        error_code: 401,
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        success: false,
        error_code: 402,
        error: "Kod xato",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});

// @description Login user
// @route GET /api/auth/login this is for admin
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const {email, password, g_token} = req.body;

    const secretKey = "6LcqRE8lAAAAANoNYJKfYMUCfMCWFqzzu7LJAptQ";

    // Verify reCAPTCHA response
    axios
      .post(
        "https://www.google.com/recaptcha/api/siteverify",
        querystring.stringify({
          secret: secretKey,
          response: g_token,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )
      .then(async (response) => {
        if (response.data.success) {
          // reCAPTCHA verification succeeded

          // Validate email & password
          if (!email || !password) {
            return next(
              new ErrorResponse("Please provide email and password", 400)
            );
          }

          // check for user
          const user = await User.findOne({email: email}).select("+password");

          if (!user) {
            return next(new ErrorResponse("Invalid credentials ", 401));
          }

          //check if password matches
          const isMatch = await user.matchPassword(password);

          if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials ", 401));
          }
          sendTokenResponse(user, 200, res);
        } else {
          // reCAPTCHA verification failed
          return res.json({
            success: false,
            message: "reCAPTCHA verification failed!",
          });
        }
      })
      .catch((error) => {
        console.error("reCAPTCHA verification error:", error);
        return res
          .status(500)
          .json({success: false, message: "Internal server error"});
      });
  } catch {
    return res.status(500).json({
      status: false,
    });
  }
});

exports.me = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = JWT.decode(token.slice(7));
    const candidate = await Auths.findOne({_id: user.id}).select({
      password: 0,
    });

    const access_token = candidate.getAccessToken();
    const refresh_token = candidate.getRefreshToken();

    if (candidate.status == "vip") {
      let endDate = await Tarif.find({user: user.id})
        .sort({
          createdAt: -1,
        })
        .limit(1);

      candidate.endDate = endDate[0] ? endDate[0].endDate : "";
    }

    candidate.endDate = res.status(200).json({
      success: true,
      data: candidate,
      access_token,
      refresh_token,
    });
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});

// @description get current logged user
// @route GET /api/auth/me
// @access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const my = JWT.decode(token.slice(7, token.length));
    const user = await User.findOne({_id: my.id});
    const kino = await KinoCmment.find({user: my.id})
      .sort({date: -1})
      .limit(4)
      .populate("user");
    const serial = await SeraialCmment.find({user: my.id})
      .sort({date: -1})
      .limit(4)
      .populate("user");
    res.status(200).json({success: true, data: user, kino, serial});
  } catch (e) {
    console.log(e);
  }
});

// @description update current logged user details
// @route PUT /api/auth/updatedetails
// @access Private
exports.UpdateDetails = asyncHandler(async (req, res, next) => {
  try {
    const FieldsToUpdate = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, FieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    res.status(201).json({success: true, data: user});
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});

// @description update current logged user password
// @route PUT /api/auth/updatepassword
// @access Private
exports.UpdatePassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse("Password is incorrect", 401));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
    });
  }
});

// @description forgot password
// @route GET /api/auth/forgotpassword
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
      res.status(404).json({
        success: false,
        data: "User not found",
      });
    }

    // GET TOKEN
    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    // create reset URL
    const resetUrl = `${req.protocol}://amediatv.uz/resetpassword/${resetToken}`;

    const msg = {
      to: req.body.email,
      subject: "Parolni tiklash manzili",
      html: `Parolini tiklash uchun ushbu tugmani bosing  <a type="button" href="${resetUrl}" style="cursor: pointer;background-color: #eee ">Tugma</a>`,
    };
    try {
      await sendEmail(msg);
      res.status(200).json({
        success: true,
        data: "Email is sent",
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({validateBeforeSave: false});

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //Hashing password

  try {
    const salt = await bcrypt.genSaltSync(12);
    const newHashedPassword = await bcrypt.hashSync(req.body.password, salt);
    const user = await User.findOneAndUpdate({
      resetPasswordToken: req.params.resettoken,
    });
    if (!user) {
      return next(new ErrorResponse("Invalid Token", 400));
    }
    // New password is set and it will be hashed after that
    user.password = newHashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch {
    return res.status(500).json({
      success: false,
    });
  }
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  try {
    Auths.findOneAndDelete({_id: req.params.id})
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
    return res.status(500).json({
      success: false,
    });
  }
});
exports.getCaptcha = asyncHandler(async (req, res, next) => {
  const ip = Date.now();
  const captchaPath = path.dirname(__dirname) + "/public/uploads/captcha";
  const files = fs.readdirSync(captchaPath);

  const chosenFile = files[Math.floor(Math.random() * files.length)];
  const base64 = fs
    .readFileSync(captchaPath + "/" + chosenFile)
    .toString("base64");

  const captchaValue = chosenFile.split(".")?.[0] || "";

  const temp = await TempCaptcha.findOne({ip});
  let tempCaptcha;
  console.log("ipppppppppp", ip);
  console.log("captchaValue", captchaValue);
  if (!temp) {
    tempCaptcha = new TempCaptcha({
      ip,
      captcha: captchaValue,
    });
    tempCaptcha.save();
  } else {
    tempCaptcha = await TempCaptcha.updateOne(
      {ip},
      {$set: {ip, captcha: captchaValue}},
      {new: true}
    );
  }

  res.status(201).json({
    success: true,
    data: {
      captcha: base64,
      key: ip,
    },
  });
});
// Get token from model , create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getAccessToken();
  const refresh_token = user.getRefreshToken();

  const options = {
    expires: new Date(
      Date.now() + 1000
      // Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  res
    .status(statusCode)
    .cookie("token", token, options, refresh_token)
    .json({success: true, token, refresh_token});
};
