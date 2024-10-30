const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // Ensure the Admin model is correctly imported
const Employee = require('../models/Employee'); // Import Employee model if you have it
const Sales = require('../models/Sale'); // Import Sales model
const SalesModel = require('../models/Sale'); // Import your Sales model
const ProductModel = require('../models/Product'); // Import your Product model
const Product = require('../models/Product'); // Adjust the path based on your project structure




// Admin login function
const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the admin by username (case insensitive)
        const admin = await Admin.findOne({ Username: { $regex: new RegExp('^' + username + '$', 'i') } });

        // Check if admin exists
        if (!admin) {
            console.log('Admin not found');
            return res.render('auth/login', { error: 'Unauthorized - Admin not found' }); // Render login view with error message
        }

        // Log passwords for debugging (remove or comment out in production)
        console.log('Input password:', password);
        console.log('Stored hashed password:', admin.Password);

        // Compare input password with stored hash
        const isMatch = await bcrypt.compare(password, admin.Password);

        // Check if the password matches
        if (!isMatch) {
            console.log('Password mismatch');
            return res.render('auth/login', { error: 'Unauthorized - Password mismatch' }); // Render login view with error message
        }

        // If login is successful, set the admin in session and redirect
        req.session.admin = admin; // Store admin details in session
        console.log('Admin logged in:', admin.Username); // Log successful login
        return res.redirect('/admin/dashboard'); // Redirect to admin dashboard
    } catch (error) {
        console.error('Login error:', error); // Log the error for debugging
        return res.status(500).send('Internal server error'); // Send error response
    }
};


const getAdminDashboard = async (req, res) => {
    if (!req.session.admin) {
        return res.redirect('/auth/login');
    }

    try {
        // Total sales amount across all sales
        const totalSalesData = await SalesModel.aggregate([
            { $group: { _id: null, total: { $sum: "$TotalPrice" } } }
        ]);
        
        const totalSales = totalSalesData[0] ? totalSalesData[0].total : 0;

        // Today's sales data
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaySales = await Sales.aggregate([
            { $match: { Date: { $gte: startOfDay, $lte: endOfDay } } },
            { $group: { _id: null, totalAmount: { $sum: "$TotalPrice" }, count: { $sum: 1 } } }
        ]);

        const todaySalesAmount = todaySales[0] ? todaySales[0].totalAmount : 0;
        const salesCount = todaySales[0] ? todaySales[0].count : 0;

        // Total products, out of stock, and low stock metrics
        const totalProductsCount = await ProductModel.countDocuments();
        const outOfStockProductsCount = await ProductModel.countDocuments({ Quantity: 0 });
        const lowStockThreshold = 3;
        const lowStockProductsCount = await ProductModel.countDocuments({ Quantity: { $lte: lowStockThreshold } });

        res.render('admin/dashboard', {
            admin: req.session.admin,
            totalSales,
            totalProducts: totalProductsCount,
            outOfStockProducts: outOfStockProductsCount,
            lowStockProducts: lowStockProductsCount,
            todaySalesAmount,
            salesCount
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('admin/dashboard', {
            admin: req.session.admin,
            totalSales: 0,
            totalProducts: 0,
            outOfStockProducts: 0,
            lowStockProducts: 0,
            todaySalesAmount: 0,
            salesCount: 0
        });
    }
};












// View employees function
const viewEmployees = async (req, res) => {
    try {
        const employees = await Employee.find(); // Assuming you have an Employee model
        return res.render('admin/employee', { employees, admin: req.session.admin }); // Pass the admin object along with employee data
    } catch (error) {
        console.error('Error fetching employees:', error);
        return res.status(500).send('Internal server error');
    }
};

const viewSales = async (req, res) => {
    try {
        const products = await ProductModel.find(); // Fetch products from the database
        const sales = await SalesModel.find(); // Fetch sales data
        const categories = [...new Set(products.map(product => product.category))]; // Extract unique categories
        const admin = req.session.admin || {}; // Admin session data

        res.render('admin/sales', { sales, categories, products, admin }); // Pass categories to the view
    } catch (error) {
        console.error('Error in viewSales:', error);
        res.status(500).send(`Server Error: ${error.message}`);
    }
};




// Function to add a sale
const addSale = async (req, res) => {
    try {
        const newSale = new Sale(req.body); // Create a new Sale instance with form data
        await newSale.save(); // Save to the database
        res.redirect('/sales'); // Redirect to the sales view
    } catch (error) {
        console.error('Error adding sale:', error);
        res.status(500).send('Error adding sale');
    }
};

const getProductsByCategory = async (req, res) => {
    const { category } = req.params; // Get the category from URL parameters
    try {
        const products = await Product.find({ Category: category }); // Fetch products by category
        res.json(products); // Respond with the products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};





// Export functions
module.exports = {
    loginAdmin,
    viewEmployees,
    viewSales,
    addSale,
    getProductsByCategory,
    getAdminDashboard,
};
