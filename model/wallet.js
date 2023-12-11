const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    }
});

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    transactions: [transactionSchema]
});

module.exports = mongoose.model('wallet', walletSchema);
