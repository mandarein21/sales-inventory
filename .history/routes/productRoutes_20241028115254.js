const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { deleteProduct } = require('../controllers/productController'); // Import the deleteProduct function
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const Category = require('../models/Category'); // Adjust the path as needed
const { getProductById } = require('../controllers/productController'); // Adjust path as needed

// Route to get a product by ID



router.get('/sales', adminController.viewSales);


router.get('/products', productController.getProducts);






// Add Product Route
router.post('/add-product', async (req, res) => {
    try {
        const productID = parseInt(req.body.productId, 10); // Fix the naming
        if (isNaN(productID)) {
            return res.status(400).json({ message: 'ProductID must be a number.' });
        }

        const categoryID = parseInt(req.body.CategoryID, 10); // Corrected here
        if (isNaN(categoryID)) {
            return res.status(400).json({ message: 'CategoryID must be a number.' });
        }

        // Check if CategoryID exists in the Category collection
        const categoryExists = await Category.findOne({ CategoryID: categoryID });
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid CategoryID: Category does not exist.' });
        }

        const newProduct = new Product({
            ProductID: productID,
            ProductName: req.body.productName, // Add other fields
            CategoryID: categoryID,
            Quantity: req.body.quantity,
            Price: req.body.price,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
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


router.get('/products/:id/price', async (req, res) => {
    try {
        const product = await Product.findOne({ ProductID: req.params.id });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, price: product.Price });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
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




// PUT route to update an existing product
router.put('/update/:id', async (req, res) => {
    const productId = req.params.id;
    const { ProductName, Category, Quantity, Price } = req.body;

    try {
        const updatedProduct = await Product.findOneAndUpdate(
            { ProductID: productId },
            { ProductName, Category, Quantity, Price },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Error updating product', error });
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
