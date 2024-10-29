const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    ProductID: {
        type: Number,
        required: true,
        unique: true,
    },
    ProductName: {
        type: String,
        required: true,
    },
    CategoryID: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId instead of Number
        ref: 'Category', // Adjust this to your Category model name
        required: true,
    },
    Quantity: {
        type: Number,
        required: true,
    },
    Price: {
        type: Number,
        required: true,
    },
    // Add other fields as necessary
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
