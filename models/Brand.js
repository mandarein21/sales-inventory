// models/Brand.js
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    BrandID: { type: Number, required: true, unique: true },
    BrandName: { type: String, required: true },
    SubCategoryID: { type: Number, required: true } // Reference to SubCategory
});

// Create and export the brand model
const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
