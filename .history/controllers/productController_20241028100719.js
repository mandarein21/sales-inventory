const Product = require('../models/Product');

const Category = require('../models/Category'); // Adjust the path as necessary


// Add Product
const addProduct = async (req, res) => {
    const { ProductID, ProductName, Category, Quantity, Price } = req.body;
    try {
        const newProduct = new Product({ ProductID, ProductName, Category, Quantity, Price });
        await newProduct.save();
        res.redirect('/products');
    } catch (error) {
        console.error('Error adding product:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error adding product. Please try again.', error });
    }
};


// Get Products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Fetch products
        const categories = await Category.find(); // Fetch categories

        // Ensure to log the output for debugging
        console.log('Products:', products);
        console.log('Categories:', categories);

        const admin = req.session.admin || {}; // Default to an empty object if admin is not defined
        res.render('product', { products, categories, admin }); // Pass products, categories, and admin to the view
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error'); // Handle errors appropriately
    }
};

// Update Product
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { ProductName, Category, Quantity, Price } = req.body;
    await Product.findByIdAndUpdate(id, { ProductName, Category, Quantity, Price });
    res.redirect('/products');
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id; // Extracting the custom ProductID from request params

        // Find and delete product based on custom ProductID
        const result = await Product.findOneAndDelete({ ProductID: productId });

        if (!result) {
            return res.status(404).send({ message: 'Product not found' });
        }

        res.status(200).send({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).send({ message: 'Failed to delete product', error: error.message });
    }
};
const getProductById = async (req, res) => {
    const productId = req.params.id; // Use the ID from the request parameters
    try {
        const product = await Product.findOne({ ProductID: productId }); // Ensure this matches your schema

        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product); // Respond with the product data
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Server error');
    }
};


module.exports = { addProduct, getProducts, updateProduct, deleteProduct, getProductById }; // Ensure this includes all necessary functions




