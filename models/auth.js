const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const Balance = require("./balance");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [255, "Name can't be more than 255 characters"],
    trim: true,
  },
  endDate: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
    maxlength: [1024, "Name can't be more than 1024 characters"],
    trim: true,
    select: false,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "publisher", "admin"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["user", "vip"],
    default: "user",
  },
  balance: {
    type: Number,
    default: 0,
  },
  uid: {type: Number, required: true, unique: true},
  photo: String,
  balanceJournals: {type: String},
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Sign JWT and return
userSchema.methods.getAccessToken = function () {
  return JWT.sign({id: this._id}, process.env.JWT_KEY, {
    expiresIn: "1d",
  });
};
userSchema.methods.getRefreshToken = function () {
  return JWT.sign({id: this._id}, process.env.JWT_KEY, {
    expiresIn: "30d",
  });
};

//  Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("Auth", userSchema);

module.exports = User;
