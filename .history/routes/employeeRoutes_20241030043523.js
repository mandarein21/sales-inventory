const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth'); // Import the middleware
const employeeController = require('../controllers/employeeController'); // Adjust the path if necessary
const {
    employeeLogin,
    viewProducts,
    empDashboard
} = require('../controllers/employeeController');
// Route to handle employee sales view
router.get('/empsales', checkAuth, employeeController.viewEmployeeSales);

// Example route handler
router.get('/dashboard', (req, res) => {
    res.send('Employee Dashboard');
});
// Define your employee dashboard route (GET)
router.get('/empdashboard', checkAuth, empDashboard);

// Define the route for viewing products
router.get('/empproduct', checkAuth, viewProducts); 

router.get('/dashboard', empDashboard);

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Internal server error'); // Handle error
        }
        // Clear the session cookie
        res.clearCookie('connect.sid', { path: '/' });
        
        // Redirect to login page with a message
        res.redirect('/auth/login');
    });
});

// Define your login route (POST)
router.post('/login', employeeLogin); // Handle employee login

// POST route for employee login
//router.post('/employee/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const employee = await Employee.findOne({ Username: username });
        if (!employee) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, employee.Password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Set session information for employee
        req.session.userId = employee._id;
        req.session.role = 'employee';
        res.status(200).json({ message: 'Employee login successful', role: employee.Role });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Define your employee dashboard route (GET)
router.get('/empdashboard', (req, res) => {
    // Render the employee dashboard view
    if (req.session.employee) {
        res.render('employee/empdashboard', { employee: req.session.employee }); // Ensure this points to your dashboard view
    } else {
        res.redirect('/auth/login'); // Redirect to login if not authenticated
    }
});


// Assuming express-session is being used to store the employee information
router.get('/employee/product', (req, res) => {
    const employee = req.session.employee; // or req.user, depending on how you store the data
    
    if (employee) {
        res.render('employee/empproduct', { employee: Username });
    } else {
        res.redirect('/login'); // Redirect to login if no employee is found
    }
});

// Define the route for employee products (GET)
router.get('/empproduct', viewProducts); // Route for products




// Employee logout route (GET)
router.get('/logout', (req, res) => {
    req.session.destroy(); // Destroy session on logout
    res.redirect('/auth/login'); // Redirect to login page after logout
});



module.exports = router;
