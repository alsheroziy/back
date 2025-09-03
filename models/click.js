const mongoose = require('mongoose')

const click = new mongoose.Schema({
    client: { type: Number },
    buy: { type: Number },
    state: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['waiting', 'payed', 'canceled'], required: true },
    merchant_prepare_id: { type: String, required: true, unique: true },
    click_transaction_id: { type: String, required: true },
    paydoc_id: { type: String },
    click_prepare_confirm: { type: Number },
    reason: { type: String },
    create: { type: Date },
    cancel: { type: Date },
    perform: { type: Date }
}, { timestamps: true })

module.exports = mongoose.model('Click', click)