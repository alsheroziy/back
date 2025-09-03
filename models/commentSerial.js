const mongoose = require('mongoose');

const commentSeriyaSchema = mongoose.Schema({
 message: {
  type: String,
  required: [true, 'Please add a product message'],
  trim: true
 },
 season: {
  type: mongoose.Schema.ObjectId,
  ref: 'season'
 },
 user: {
  type: mongoose.Schema.ObjectId,
  required: true,
  ref: 'Users'
 },
 type: {type: Number, default: 0},
 date: {
  type: Date,
  default: Date.now()
 }
});

module.exports = mongoose.model('commentSeriya', commentSeriyaSchema);
