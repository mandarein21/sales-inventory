const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Ensure this is correctly implemented
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const path = require('path'); // Make sure you import 'path'
const salesRoutes = require('./routes/salesRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const Product = require('./models/Product'); // Import the Product model
const Sale = require('./models/Sale'); // Adjust the path if needed
const Employee = require('./models/Employee'); // Adjust the path as necessary
const categoriesRoutes = require('./routes/categoriesRoutes'); 
const Category = require('./models/Category'); // Adjust the path as necessary
const { Types } = mongoose; // Add this line to access Types
const bcrypt = require('bcrypt'); // Add this line at the top
const Admin = require('./models/Admin');











// Initialize app before using it
const app = express(); // <-- Moved to the top
const methodOverride = require('method-override');




const cors = require('cors');


app.set('views', './views'); // Set the views directory (this is usually the default)
app.use(cors());

// Load environment variables from .env file
dotenv.config();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Only need this once

// Use method-override middleware
app.use(methodOverride('_method'));

// Set up session handling
app.use(session({
    secret: process.env.SESSION_SECRET || '80985c481ba7c63385731f7aa58e8250c0846b4bd9cc0545a497c803534c66aaet', // Ensure you have a fallback for session secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI || 'mongodb+srv://gmercadouser:gmercadodbUser@cluster1.iwwa5.mongodb.net/gmercadoDB?retryWrites=true&w=majority',
    }),
}));

// Middleware to make 'employee' available to all views
app.use((req, res, next) => {
    res.locals.employee = req.session.employee || null; // If employee is in session, make it available in all views
    next();
});


// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Routes
app.use('/', adminRoutes);
app.use('/admin', adminRoutes);
app.use('/products', productRoutes);
app.use('/api/products', productRoutes);
app.use('/auth', authRoutes); // Set up the product routes
app.use('/api/sales', salesRoutes);
app.use('/employee', employeeRoutes); // Ensure this is correctly placed
app.use('/', employeeRoutes); // Mount employeeRoutes without any prefix
app.use('/sales', salesRoutes);
// Use the categories routes
app.use('/admin', categoriesRoutes); // This mounts the routes at /admin
app.use('/admin/api', productRoutes); // Mount your routes
// Use the product routes
app.use('/admin/products', productRoutes);

app.use('/admin', productRoutes); // Ensure this is set correctly



//sa pagaadd to ng sales sa pagget ng product
app.get('/admin/api/products', async (req, res) => {
    const categoryId = req.query.categoryId;
    console.log('Fetching products for categoryId:', categoryId); // Debugging log
    try {
        const products = await Product.find({ categoryId: categoryId }); // Adjust based on your schema
        console.log('Fetched products:', products); // Debugging log
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});





// Use the product routes under /api


app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ Username: username });
        if (!admin) return res.status(401).send('Admin not found');

        const isMatch = await bcrypt.compare(password, admin.Password);
        if (!isMatch) return res.status(401).send('Invalid credentials');

        // Set session data for admin without the role
        req.session.admin = {
            Username: admin.Username // Only store the Username
        };

        console.log('Admin Logged In:', req.session.admin); // Check session data
        res.redirect('/products'); // Redirect after login
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});






app.get('/products', async (req, res) => {
    console.log('Current Session on Products:', req.session); // Check session data

    try {
        // Check if session admin is populated
        const admin = req.session.admin ? { Username: req.session.admin.Username } : null;

        console.log('Admin Object:', admin); // Log admin object

        // Fetch products and categories
        const products = await Product.find().populate('CategoryID', 'CategoryName');
        const categories = await Category.find();

        // Render the view with products, categories, and admin data
        res.render('product', { products, categories, admin });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Server Error');
    }
});




// Assuming a route handler in Express
app.get('/admin/api/products/:productId', async (req, res) => {
    try {
        const product = await Product.findOne({ ProductID: req.params.productId }).lean();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



app.post('/products/update/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).send('Product not found');
        }
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// Edit Category Route
app.post('/admin/categories/edit/:id', async (req, res) => {
    try {
        const { CategoryName } = req.body;
        const categoryId = req.params.id;

        // Logic to find and update the category in the database
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, { CategoryName }, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, message: 'Category updated successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// app.js
app.get('/products/:id', async (req, res) => {
    try {
        // Populate category if it's a reference in the Product schema
        const product = await Product.findById(req.params.id).populate('category');
        if (!product) {
            return res.status(404).send('Product not found');
        }
        
        res.json({
            ProductID: product._id,
            ProductName: product.name,
            Quantity: product.quantity,
            Price: product.price,
            CategoryID: product.category ? product.category._id : null, // Pass the category ID
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});




//sa pageedit ng product
app.put('/api/products/:id', async (req, res) => {
    const { ProductName, CategoryID, Quantity, Price } = req.body;

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ProductName,
                CategoryID: mongoose.Types.ObjectId(CategoryID), // Convert to ObjectId here if needed
                Quantity,
                Price
            },
            { new: true }
        );

        if (!updatedProduct) return res.status(404).send('Product not found');
        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Server error');
    }
});






//getting category
app.get('/admin/api/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories
        res.json(categories); // Should be an array like [{ _id: '1', name: 'Electronics' }, ...]
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete Category Route
app.delete('/admin/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;

        const deletedCategory = await Category.findByIdAndDelete(categoryId);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, message: 'Category deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


// Assuming Express.js is used
app.get('/api/products/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching product' });
    }
});


app.get('/products', async (req, res) => {
    const employee = req.session.employee; // Assuming employee info is stored in session
    const admin = req.session.admin; // Assuming you're storing admin details in session

    try {
        // Fetch products and categories
        const products = await Product.find(); // Fetch products from the database
        const categories = await Category.find(); // Fetch categories from the database

        // Render the product view, passing both products and categories
        res.render('product', { products, categories, employee, admin });
    } catch (error) {
        console.error('Error fetching products or categories:', error);
        res.status(500).send('Internal Server Error');
    }
});


//adding categories
app.post('/admin/categories/add', (req, res) => {
    const { CategoryName } = req.body;

    if (!CategoryName) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    // Example database insertion logic
    CategoryModel.create({ CategoryName })
        .then(() => {
            res.status(201).json({ success: true, message: 'Category added successfully!' });
        })
        .catch(err => {
            console.error('Error adding category:', err);
            res.status(500).json({ success: false, message: 'Server error while adding category.' });
        });
});


app.get('/admin/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Ensure this is fetching categories correctly
        res.json(categories); // Send back categories as JSON
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});





// Admin products route
app.get('/products', (req, res) => {
    const admin = req.session.admin;

    console.log('Admin session:', admin); // Check if admin info is available

    if (!admin) {
        return res.redirect('/auth/login?message=You%20need%20to%20log%20in%20first');
    }

    res.render('product', { admin });
});


//FETCHING CATEGORY IN ADDING PRODUCT MODAL
app.get('/admin/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Ensure this is fetching categories correctly
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//ADDING PRODUCT
app.post('/add-product', async (req, res) => {
    const { ProductID, ProductName, CategoryID, Quantity, Price } = req.body;

    try {
        const newProduct = new Product({
            ProductID,
            ProductName,
            CategoryID,
            Quantity,
            Price,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully!' });
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ message: 'An error occurred while adding the product.' });
    }
});











app.post('/sales/add', async (req, res) => {
    const {
        CusName, Date, CusAdd, CusContact,
        ProductID, Quantity, MethPay, AmountPayment
    } = req.body;

    // Default balance to 0 if not provided
    const Balance = req.body.Balance || 0;

    // Ensure all required fields are present
    if (!CusName || !Date || !CusAdd || !CusContact || !ProductID || !Quantity || !MethPay || !AmountPayment) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Fetch product details using ProductID
        const product = await Product.findById(ProductID); // Adjust the query if ProductID is not an ObjectId

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Create a new sale record
        const newSale = new Sale({
            CusName,
            Date,
            CusAdd,
            CusContact,
            ProductCategory: product.Category, // Get category from the product
            ProductName: product.ProductName,   // Get product name from the product
            ProductID,
            Quantity,
            MethPay,
            AmountPayment,
            Balance
        });

        // Save the sale to the database
        await newSale.save();

        // Return success response
        res.status(201).json({ message: 'Sale added successfully!', sale: newSale });
    } catch (error) {
        console.error('Error adding sale:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});









app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Authenticate user logic here
    const isAuthenticated = true; // Dummy check for example

    if (isAuthenticated) {
        return res.redirect('/empdashboard'); // Redirect to empdashboard after successful login
    } else {
        res.status(401).send('Unauthorized'); // Or handle error
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the employee by Username
        const employee = await Employee.findOne({ Username: username });

        if (employee && bcrypt.compareSync(password, employee.Password)) {
            // Store the employee in session
            req.session.employee = employee;
            res.redirect('/employee/product');
        } else {
            res.status(400).send('Invalid credentials');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



app.get('/empproduct', (req, res) => {
    // Assuming employee info is stored in session or elsewhere
    const employee = req.session.employee; // or however you manage user sessions

    if (employee) {
        res.render('employee/empproduct', { employee: employee });
    } else {
        res.redirect('auth/login'); // Redirect to login if not authenticated
    }
});
app.get('/empsales', (req, res) => {
    // Assuming employee info is stored in session or elsewhere
    const employee = req.session.employee; // or however you manage user sessions

    if (employee) {
        res.render('employee/empproduct', { employee: employee });
    } else {
        res.redirect('auth/login'); // Redirect to login if not authenticated
    }
});


app.delete('/admin/categories/:id', (req, res) => {
    const categoryId = req.params.id;

    Category.findByIdAndDelete(categoryId)
        .then(result => {
            if (result) {
                res.json({ success: true });
            } else {
                res.json({ success: false, message: 'Category not found.' });
            }
        })
        .catch(err => {
            console.error(err); // Log the error for debugging
            res.status(500).json({ success: false, message: 'Failed to delete category.' });
        });
});



// Use employee routes with a prefix
app.use('/employee', employeeRoutes);

// Other route definitions and server setup
app.get('/', (req, res) => {
    res.redirect('/employee/login'); // Redirect to the login page by default
});

// Define your routes
app.get('/employee/dashboard', (req, res) => {
    // Get the employee object from the session or database
    const employee = req.session.employee; // Ensure this is correctly set

    // Check if employee is defined
    if (!employee) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    // Render the employee dashboard and pass the employee object
    res.render('employee/empdashboard', { employee });
});


// Search route for products
app.get('/search', async (req, res) => {
    const productCode = req.query.code;
    const isNumeric = !isNaN(productCode);

    try {
        const query = isNumeric ? { ProductID: Number(productCode) } : {
            $or: [
                { ProductName: { $regex: productCode, $options: 'i' } },
                { Category: { $regex: productCode, $options: 'i' } },
            ]
        };

        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Server-side (e.g., in Express.js)
app.post('/sales/add', (req, res) => {
    const saleData = req.body; // Get the data from the request body
    console.log('Received sale data:', saleData); // Log data for debugging
    
    // TODO: Add logic to save the data to the database

    res.json({ success: true, message: 'Sale added successfully!' }); // Respond with success message
});

app.get('/products', (req, res) => {
    const employee = req.session.employee; // Or wherever you store your admin information
    const admin = req.session.admin; // Assuming you're storing admin details in session

    res.render('product', { employee, admin }); // Pass both employee and admin to the template
});



// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

