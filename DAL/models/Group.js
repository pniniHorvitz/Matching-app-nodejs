const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
    id: Number,
    name: String,
    target: Number
});
module.exports = mongoose.model('Group', groupSchema);