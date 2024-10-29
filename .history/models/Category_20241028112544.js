const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const categorySchema = new mongoose.Schema({
    CategoryID: { type: Number, unique: true },
    CategoryName: { type: String, required: true }
});

// Apply the auto-increment plugin to the CategoryID field
categorySchema.plugin(AutoIncrement, { inc_field: 'CategoryID' });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
