const mongoose = require('mongoose');
const donationSchema = new mongoose.Schema({
    id: Number,
    donorName: String,
    solicitorId: String,
    groupId: String,
    amount: Number,
    message: String,
    date: Date
});
module.exports = mongoose.model('Donation', donationSchema);