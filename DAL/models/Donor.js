const mongoose = require('mongoose');
const donorSchema = new mongoose.Schema({
    id: Number,
    name: String,
    personalTarget: Number,
    secretCode: String,
    groupId: Number
});
module.exports = mongoose.model('Donor', donorSchema);