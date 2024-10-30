

module.exports = (req, res, next) => {
    if (!req.session.admin) {
        // Redirect to login page with a query parameter for the message
        return res.redirect('/auth/login?message=You need to log in first');
    }
    next(); // Proceed to the next middleware or route handler if authenticated
};

// middleware/auth.js
module.exports = (req, res, next) => {
    if (req.session && req.session.employee) {
        next(); // Employee is authenticated
    } else {
        res.redirect('/auth/login?message=You%20need%20to%20log%20in%20first');
    }
};



