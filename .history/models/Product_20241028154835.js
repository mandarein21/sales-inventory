const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    ProductID: { type: Number, required: true, unique: true },
    ProductName: { type: String, required: true },
    Category: { type: Number, required: true },
    Quantity: { type: Number, required: true },
    Price: { type: Number, required: true }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
