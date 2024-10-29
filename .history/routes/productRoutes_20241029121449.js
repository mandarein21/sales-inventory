const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { deleteProduct } = require('../controllers/productController'); // Import the deleteProduct function
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const Category = require('../models/Category'); // Adjust the path as needed
const { getProductById } = require('../controllers/productController'); // Adjust path as needed



router.get('/sales', adminController.viewSales);


// Route to get all categories
router.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to get products and render product.ejs
// Route to render product.ejs with products for admin view
router.get('/view-products', async (req, res) => {
    try {
        const products = await Product.find().populate('CategoryID');
        const admin = true; // Example admin check
        res.render('product', { products, admin });
    } catch (error) {
        console.error('Error rendering products:', error);
        res.status(500).send('Server Error');
    }
});

// Fetch all products
router.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().populate('CategoryID'); // Populate if you want category details
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});



// In productRoutes.js
router.get('/api/products/:id', async (req, res) => {
    console.log('Received ID:', req.params.id); // Log the received ID
    try {
        const product = await Product.findOne({ ProductID: parseInt(req.params.id, 10) });
        console.log('Found Product:', product); // Log the product found
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Update product route
// Inside your routes file (e.g., productRoutes.js)
// Inside your routes file (e.g., productRoutes.js)
router.put('/update/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id, 10); // Get the ProductID from the route parameters

        const updatedProduct = req.body; // Expecting the updated product details in the request body

        // Update the product in the database
        const result = await Product.findOneAndUpdate(
            { ProductID: productId },
            updatedProduct,
            { new: true }
        );

        if (!result) {
            return res.status(404).send('Product not found');
        }

        res.json(result); // Send back the updated product
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Server Error');
    }
});


// Fetch categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});



// Add Product Route
// Add Product Route
router.post('/add-product', async (req, res) => {
    console.log('Incoming request body:', req.body); // Log the incoming request body
    const { ProductID, ProductName, CategoryID, Quantity, Price } = req.body;

    const productData = {
        ProductID,
        ProductName,
        CategoryID,
        Quantity,
        Price,
    };

    try {
        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully!', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ message: 'An error occurred while adding the product.', error });
    }
});


//getting category name



router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find(); // Fetch all categories from MongoDB
        console.log("Fetched categories:", categories); // Debugging
        res.json(categories); // Send categories as JSON response
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' }); // Handle errors
    }
});



// Assuming you're using session or some method to store the employee information
router.get('/employee/product', (req, res) => {
    // Assuming employee data is stored in req.session.employee (this could vary)
    const employee = req.session.employee;  // or req.user, or however you store employee data
    
    // Check if employee data exists
    if (employee) {
        res.render('employee/empproduct', { employee: employee });
    } else {
        res.redirect('/auth/login');  // Redirect to login if no employee data is found
    }
});








// DELETE a product
router.delete('/:id', async (req, res) => {
    const productId = parseInt(req.params.id, 10);
    console.log('Attempting to delete product with ID:', productId); // Log the productId

    try {
        const deletedProduct = await Product.findOneAndDelete({ ProductID: productId });
        if (!deletedProduct) {
            console.log('Product not found in database:', productId); // Log if product not found
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Search endpoint
router.get('/search', async (req, res) => {
    const searchTerm = req.query.q; // Get the search term from the query parameter
    const query = {}; // Initialize an empty query object

    if (searchTerm) {
        // Check if the search term is a number (for ProductID)
        const isNumeric = !isNaN(searchTerm);

        if (isNumeric) {
            query.ProductID = Number(searchTerm); // Convert to number for ProductID search
        } else {
            // For ProductName and Category searches, use regex for case-insensitive matching
            query.$or = [
                { ProductName: { $regex: searchTerm, $options: 'i' } },
                { Category: { $regex: searchTerm, $options: 'i' } }
            ];
        }
    }

    try {
        const products = await Product.find(query); // Find products based on the constructed query
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
