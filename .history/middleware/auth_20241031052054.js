

module.exports = (req, res, next) => {
    if (!req.session.admin) {
        // Redirect to login page with a query parameter for the message
        return res.redirect('/auth/login?message=You need to log in first');
    }
    next(); // Proceed to the next middleware or route handler if authenticated
};





