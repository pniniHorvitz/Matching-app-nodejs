const mongoose = require('mongoose');
const campaignSchema = new mongoose.Schema({
    name: String,
    target: Number,
    deadline: String
});
module.exports = mongoose.model('Campaign', campaignSchema);