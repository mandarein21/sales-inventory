const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth'); // Import the middleware
const Category = require('../models/Category'); // Adjust the path as needed

const { dashboard } = require('../controllers/dashboardController');
const dashboardController = require('../controllers/dashboardController'); // Adjust path if necessary
const { getDashboardData } = require('../controllers/dashboardController');
const { loginAdmin, viewEmployees, viewSales, getAdminDashboard } = require('../controllers/adminController'); // Import functions\
// Import your admin controller
const adminController = require('../controllers/adminController'); // Adjust the path if necessary

// Define your routes
router.get('/dashboard', checkAuth, adminController.getAdminDashboard); // Single dashboard route

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

// Route to add a category
router.post('/categories/add', async (req, res) => {
    try {
        const { CategoryName } = req.body;

        const newCategory = new Category({ CategoryName });
        await newCategory.save();

        res.json({ success: true, message: 'Category added successfully!' });
    } catch (error) {
        console.error(error);
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