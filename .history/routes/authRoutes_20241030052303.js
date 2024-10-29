const express = require('express');
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const router = express.Router();
const { isAdmin, isEmployee } = require('./middleware/auth'); // Adjust the path as necessary

// Admin dashboard route
router.get('/admin/dashboard', isAdmin, (req, res) => {
    res.render('admin/dashboard'); // Render admin dashboard
});

// Employee dashboard route
router.get('/employee/empdashboard', isEmployee, (req, res) => {
    res.render('employee/dashboard'); // Render employee dashboard
});


// POST route for employee login
router.post('/employee/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("Employee login attempt:", req.body); // Debug log
        const employee = await Employee.findOne({ Username: username }); // Fetch employee based on username
        if (!employee) {
            return res.status(401).render('auth/login', { error: 'Invalid employee credentials.' }); // Render login with error
        }

        const isMatch = await bcrypt.compare(password, employee.Password); // Compare password
        if (!isMatch) {
            return res.status(401).render('auth/login', { error: 'Invalid employee credentials.' }); // Render login with error
        }

        // Set session information for employee
        req.session.userId = employee._id;
        req.session.role = 'employee';
        res.status(200).redirect('/employee/empdashboard'); // Redirect to employee dashboard on successful login
    } catch (error) {
        res.status(500).render('auth/login', { error: 'Server error' }); // Render login with server error
    }
});





// POST route for admin login
router.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("Admin login attempt:", req.body); // Debug log
        const admin = await Admin.findOne({ Username: username });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, admin.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Set session information for admin
        req.session.userId = admin._id;
        req.session.role = 'admin';
        res.status(200).json({ message: 'Admin login successful', role: admin.Role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// POST route for admin logout
router.post('/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.status(200).json({ message: 'Admin logged out successfully' });
    });
});

// Login page route
router.get('/login', (req, res) => {
    const message = req.query.message; // Retrieve the message from query params if it exists
    res.render('auth/login', { message }); // Pass the message to the login view
});

module.exports = router;
