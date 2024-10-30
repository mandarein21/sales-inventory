const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee'); // Ensure the Employee model is correctly imported
const Product = require('../models/Product'); // Ensure the Product model is correctly imported
const Sales = require('../models/Sale'); // Import your Sales model
const ProductModel = require('../models/Product'); // Import your Product model








// Employee login function
const employeeLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the employee by username (case insensitive)
        const employee = await Employee.findOne({ Username: { $regex: new RegExp('^' + username + '$', 'i') } });

        // Check if employee exists
        if (!employee) {
            console.log('Employee not found');
            return res.render('auth/login#', { error: 'Unauthorized - Employee not found' }); // Render login view with error message
        }

        // Log passwords for debugging (remove or comment out in production)
        console.log('Input password:', password);
        console.log('Stored hashed password:', employee.Password);

        // Compare input password with stored hash
        const isMatch = await bcrypt.compare(password, employee.Password);

        // Check if the password matches
        if (!isMatch) {
            console.log('Password mismatch');
            return res.render('auth/login', { error: 'Unauthorized - Password mismatch' }); // Render login view with error message
        }

        // If login is successful, set the employee in session and redirect
        req.session.employee = employee; // Store employee details in session
        console.log('Session after login:', req.session); // Log session data
        console.log('Employee logged in:', employee.Username); // Log successful login
        console.log('Logged in employee:', req.session.employee); // Check if employee data is set
        return res.redirect('/employee/empdashboard'); // Redirect to employee dashboard
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
            employee: req.session.employee,
            totalSales,
            totalProducts: totalProductsCount,
            outOfStockProducts: outOfStockProductsCount,
            lowStockProducts: lowStockProductsCount,
            todaySalesAmount,
            salesCount
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.render('employee/empdashboard', {
            employee: req.session.employee,
            totalSales: 0,
            totalProducts: 0,
            outOfStockProducts: 0,
            lowStockProducts: 0,
            todaySalesAmount: 0,
            salesCount: 0
        });
    }
};




const empDashboard = async (req, res) => {
    try {
        const totalProducts = await getTotalProducts(); // Function to get total products
        const outOfStockProducts = await getOutOfStockProducts(); // Function to get out of stock products
        const lowStockProducts = await getLowStockProducts(); // Define this function to get low stock products

        // Render the employee dashboard view with all relevant data
        if (req.session.employee) {
            res.render('employee/empdashboard', { 
                employee: req.session.employee, 
    
                totalProducts, 
                outOfStockProducts, 
                lowStockProducts // Pass low stock products here
            });
        } else {
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

// Example function to get low stock products
const getLowStockProducts = async () => {
    // Replace this with your actual logic to fetch low stock products
    const count = await ProductModel.countDocuments({ Quantity: { $lt: 5 } }); // Changed to 'Quantity'
    return count;
};

// Example function to get out of stock products
const getOutOfStockProducts = async () => {
    // Replace with your actual logic to fetch out of stock products
    const count = await ProductModel.countDocuments({ Quantity: 0 }); // Changed to 'Quantity'
    return count;
};

// Example function to get total products
const getTotalProducts = async () => {
    // Replace with your actual logic to fetch total products
    const products = await ProductModel.countDocuments(); // Example using Mongoose
    return products;
};



const viewEmployeeSales = async (req, res) => {
    try {
        // Fetch any necessary data for the sales page
        const sales = await Sales.find(); // Example; adjust based on your data model
        res.render('employee/empsales', { sales }); // Adjust view path as needed
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).send('Server Error');
    }
};




// View products function
const viewProducts = async (req, res) => {
    try {
        const employee = req.session.employee; // Get employee data from session
        console.log('Employee in viewProducts:', employee); // Check what employee data is being accessed
        const products = await Product.find(); // Fetch products from the database

        res.render('employee/empproduct', { employee: employee, products: products });
    } catch (error) {
        console.error("Error fetching products: ", error);
        res.status(500).send("Internal Server Error");
    }
};

// View sales function
const viewSales = async (req, res) => {
    try {
        const sales = await Sales.find(); // Fetch sales data from the Sales model
        return res.render('employee/empsales', { sales, employee: req.session.employee }); // Pass the admin object along with sales data
    } catch (error) {
        console.error('Error fetching sales:', error);
        return res.status(500).send('Internal server error');
    }
};


// Export the functions
module.exports = { employeeLogin, viewProducts, viewSales, empDashboard, viewEmployeeSales }; // Ensure viewProducts is exported
