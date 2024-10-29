// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    CategoryID: { type: Number, required: true, unique: true }, // Unique identifier for category
    CategoryName: { type: String, required: true }
});

// Create and export the category model
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
