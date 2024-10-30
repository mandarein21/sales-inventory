// controllers/dashboardController.js
const Product = require('../models/Product');

const Sales = require('../models/Sale');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

const getDashboardData = async (req, res) => {
    try {
        // Check if the admin is logged in by looking for admin in session
        if (!req.session.admin) {
            console.log('Admin not logged in');
            return res.redirect('/auth/login'); // Redirect to login if not logged in
        }

        // Get admin details from the session
        const admin = req.session.admin;

        // Fetch required data for the dashboard
        const totalSales = await Sales.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
        const totalSalesAmount = totalSales[0] ? totalSales[0].total : 0;

 
        const totalProducts = await Product.countDocuments();
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

        // Render dashboard with data
        res.render('admin/dashboard', {
            admin,
            totalSales: totalSalesAmount,
            totalProducts,
            outOfStockProducts,
            lowStockProducts,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};

const getEmpDashboardData = async (req, res) => {
    try {
        // Check if the admin is logged in by looking for admin in session
        if (!req.session.employee) {
            console.log('Employee not logged in');
            return res.redirect('/auth/login'); // Redirect to login if not logged in
        }

        // Get admin details from the session
        const employee = req.session.employee;

        // Fetch required data for the dashboard
        const totalSales = await Sales.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
        const totalSalesAmount = totalSales[0] ? totalSales[0].total : 0;

        const totalProducts = await Product.countDocuments();
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

        // Render dashboard with data
        res.render('employee/empdashboard', {
            employee,
            totalSales: totalSalesAmount,
            totalProducts,
            outOfStockProducts,
            lowStockProducts,
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    getDashboardData,
    getEmpDashboardData
};
