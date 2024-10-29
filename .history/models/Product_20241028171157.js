const mongoose = require('mongoose');

// Assuming CategoryID is an ObjectId referencing the Category model
const productSchema = new mongoose.Schema({
    ProductID: { type: Number, required: true, unique: true },
    ProductName: { type: String, required: true },
    CategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to Category
    Quantity: { type: Number, required: true },
    Price: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
