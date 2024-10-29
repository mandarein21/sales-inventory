const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth'); // Import the middleware
const Category = require('../models/Category'); // Adjust the path as needed
const productController = require('../controllers/productController');
const { dashboard } = require('../controllers/dashboardController');
const dashboardController = require('../controllers/dashboardController'); // Adjust path if necessary
const { getDashboardData } = require('../controllers/dashboardController');
const { loginAdmin, viewEmployees, viewSales, getAdminDashboard } = require('../controllers/adminController'); // Import functions\
// Import your admin controller
const adminController = require('../controllers/adminController'); // Adjust the path if necessary

// Define your routes
router.get('/dashboard', checkAuth, adminController.getAdminDashboard); // Single dashboard route


// Example route
router.get('/admin/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

// In your adminRoutes.js
router.put('/update-product/:id', productController.updateProduct);

// In your adminRoutes.js
router.get('/products/:id', productController.getProductById);


// DELETE product by ID
router.delete('/api/products/:id', productController.deleteProduct);
// Route for admin login
router.post('/login', adminController.loginAdmin); 
// In your routes file
router.get('/api/products/:category', adminController.getProductsByCategory);

// New route for /admin/employee
router.get('/employee', checkAuth, adminController.viewEmployees);

// New route for /admin/sales
router.get('/sales', checkAuth, adminController.viewSales); // Ensure you implement viewSales in the controller

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Internal server error'); // Handle error
        }
        // Clear the session cookie
        res.clearCookie('connect.sid', { path: '/' });
        
        // Redirect to login page with a message
        res.redirect('/auth/login');
    });
});

router.post('/categories/add', async (req, res) => {
    try {
        console.log(req.body);  // Log the incoming request body

        const { CategoryName } = req.body;

        // Ensure CategoryName is provided
        if (!CategoryName) {
            return res.status(400).json({ success: false, message: 'CategoryName is required.' });
        }

        // Fetch the latest CategoryID
        const latestCategory = await Category.findOne({}, {}, { sort: { 'CategoryID': -1 } });
        const newCategoryID = latestCategory ? latestCategory.CategoryID + 1 : 1; // Start from 1 if no categories exist

        const newCategory = new Category({ CategoryID: newCategoryID, CategoryName });
        await newCategory.save();

        res.json({ success: true, message: 'Category added successfully!' });
    } catch (error) {
        console.error('Error adding category:', error);  // Log the error for debugging
        res.status(500).json({ success: false, message: 'Failed to add category.' });
    }
});



router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories from the database
        
        // Assuming you store admin data in the session
        const admin = req.session.admin || {}; // Ensure this retrieves the admin details correctly

        res.render('admin/categories', { categories, admin }); // Pass both categories and admin to the view
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



module.exports = router;
