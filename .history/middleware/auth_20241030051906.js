

module.exports = (req, res, next) => {
    if (!req.session.admin) {
        // Redirect to login page with a query parameter for the message
        return res.redirect('/auth/login?message=You need to log in first');
    }
    next(); // Proceed to the next middleware or route handler if authenticated
};



// auth.js in middleware folder

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (!req.session.admin) {
        // Redirect to login page with a query parameter for the message
        return res.redirect('/auth/login?message=You%20need%20to%20log%20in%20first');
    }
    next(); // Proceed to the next middleware or route handler if authenticated
};

// Middleware to check if user is an employee
const isEmployee = (req, res, next) => {
    if (!req.session.employee) {
        // Redirect to login page with a query parameter for the message
        return res.redirect('/auth/login?message=You%20need%20to%20log%20in%20first');
    }
    next(); // Proceed to the next middleware or route handler if authenticated
};

module.exports = {
    isAdmin,
    isEmployee
};

