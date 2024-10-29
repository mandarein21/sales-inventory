const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    Username: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    // Add other fields as necessary
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
