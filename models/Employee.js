const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    UserID: { type: Number, required: true },
    Username: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
});

module.exports = mongoose.model('Employee', employeeSchema);
