// controllers/dashboardController.js
const Product = require('../models/Product');

const Sales = require('../models/Sale');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

const getDashboardData = async (req, res) => {
    try {
        if (!req.session.admin) {
            console.log('Admin not logged in');
            return res.redirect('/auth/login');
        }

        const admin = req.session.admin;

        // Get total sales amount
        const totalSales = await Sales.aggregate([
            { $group: { _id: null, total: { $sum: "$TotalPrice" } } }
        ]);
        const totalSalesAmount = totalSales[0] ? totalSales[0].total : 0;

        // Get today's sales data
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

        // Get today's sales
        const todaySales = await Sales.aggregate([
            { $match: { Date: { $gte: startOfDay, $lte: endOfDay } } },
            { $group: { _id: null, totalAmount: { $sum: "$TotalPrice" }, count: { $sum: 1 } } }
        ]);

        const todaySalesAmount = todaySales[0] ? todaySales[0].totalAmount : 0;
        const todaySalesCount = todaySales[0] ? todaySales[0].count : 0;

        const totalProducts = await Product.countDocuments();
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

        // Render the dashboard with the gathered data
        res.render('admin/dashboard', {
            admin,
            totalSales: totalSalesAmount,
            salesCount, // This will still show total sales count
            todaySalesCount, // Pass today's sales count
            totalProducts,
            outOfStockProducts,
            lowStockProducts,
            todaySalesAmount, // Pass today's sales amount
        });
        
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Internal Server Error");
    }
};


const getEmpDashboardData = async (req, res) => {
    try {
        if (!req.session.admin) {
            console.log('Employee not logged in');
            return res.redirect('/auth/login#');
        }

        const employee = req.session.employee;

        // Get total sales amount
        const totalSales = await Sales.aggregate([
            { $group: { _id: null, total: { $sum: "$TotalPrice" } } }
        ]);
        const totalSalesAmount = totalSales[0] ? totalSales[0].total : 0;

        // Get today's sales data
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

        // Get today's sales
        const todaySales = await Sales.aggregate([
            { $match: { Date: { $gte: startOfDay, $lte: endOfDay } } },
            { $group: { _id: null, totalAmount: { $sum: "$TotalPrice" }, count: { $sum: 1 } } }
        ]);

        const todaySalesAmount = todaySales[0] ? todaySales[0].totalAmount : 0;
        const todaySalesCount = todaySales[0] ? todaySales[0].count : 0;

        const totalProducts = await Product.countDocuments();
        const outOfStockProducts = await Product.countDocuments({ stock: 0 });
        const lowStockProducts = await Product.countDocuments({ stock: { $lt: 5 } });

        // Render the dashboard with the gathered data
        res.render('employee/empdashboard', {
            employee,
            totalSales: totalSalesAmount,
            salesCount, // This will still show total sales count
            todaySalesCount, // Pass today's sales count
            totalProducts,
            outOfStockProducts,
            lowStockProducts,
            todaySalesAmount, // Pass today's sales amount
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
