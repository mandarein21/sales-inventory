const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    ProductID: Number,
    ProductName: String,
    Quantity: Number,
    Price: Number,
    CategoryID: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' } // Assuming you're using ObjectId
});


const Product = mongoose.model('Product', productSchema);
module.exports = Product;
