const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    ProductID: { type: Number, required: true, unique: true },
    ProductName: { type: String, required: true },
    CategoryID: { type: Number, ref: 'Category', required: true }, // Update to match CategoryID in Category model
    Quantity: { type: Number, required: true },
    Price: { type: Number, required: true }
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;
