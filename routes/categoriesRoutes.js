const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Adjust the path as necessary

// API route to fetch categories as JSON
router.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch categories from the database
        res.json(categories); // Return categories as JSON
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Existing route to render the admin categories view
router.get('/categories', (req, res) => {
    // Logic to render your categories view (admin/categories.ejs)
    res.render('admin/categories'); // Adjust as necessary
});


// Add Category Route
router.post('/add', async (req, res) => {
    const { CategoryName } = req.body; // Ensure this matches the model field

    try {
        // Determine the next CategoryID
        const count = await Category.countDocuments();
        const newCategoryID = count + 1; // Incremental ID

        const newCategory = new Category({ 
            CategoryID: newCategoryID, // Assign unique CategoryID
            CategoryName // Ensure this matches the model field name
        });

        await newCategory.save();
        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Failed to add category' });
    }
});


// Edit Category Route
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { CategoryName } = req.body;

    try {
        await Category.findByIdAndUpdate(id, { CategoryName });
        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'Failed to edit category' });
    }
});

// DELETE route for categories
router.delete('/admin/categories/:id', (req, res) => {
    const categoryId = req.params.id;

    // Logic to delete the category from the database
    Category.findByIdAndDelete(categoryId)
        .then(result => {
            if (result) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Category not found.' });
            }
        })
        .catch(err => {
            res.status(500).json({ success: false, message: 'Failed to delete category.' });
        });
});




module.exports = router;
