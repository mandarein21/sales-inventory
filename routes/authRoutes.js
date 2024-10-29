const express = require('express');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const router = express.Router();


// Route to display the login page
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null }); // Pass error as null initially
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
