// auth.js

// Middleware to check if an admin is authenticated
const adminAuthMiddleware = (req, res, next) => {
    if (!req.session.admin) {
        return res.redirect('/auth/login?message=You%20need%20to%20log%20in%20first'); // Redirect to login page if not logged in
    }
    next(); // Admin is authenticated, proceed to the next middleware
};

// Middleware to check if an employee is authenticated
const employeeAuthMiddleware = (req, res, next) => {
    if (!req.session.employee) {
        return res.redirect('/auth/login?message=You%20need%20to%20log%20in%20first'); // Redirect to login page if not logged in
    }
    next(); // Employee is authenticated, proceed to the next middleware
};

// Export both middleware functions
module.exports = { adminAuthMiddleware, employeeAuthMiddleware };
