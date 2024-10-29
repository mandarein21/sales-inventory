const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const Sale = require('../models/Sale'); // Ensure this model is imported
const Product = require('../models/Product'); // Adjust the path according to your project structure
const adminController = require('../controllers/adminController');

// Route for viewing sales
router.get('/sales', salesController.viewSales); // Changed to use the controller

router.post('/add', async (req, res) => {
    const { CusName, CusAdd, CusContact, ProductID, Quantity, MethPay, NumMonths, AmountPayment } = req.body;

    try {
        // Find the product using the unique ProductID
        const product = await Product.findOne({ ProductID: ProductID });
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Check if the requested quantity is available
        if (product.Quantity < Quantity) {
            return res.status(400).send("Not enough product quantity available");
        }

        // Debugging logs to check values before creating the sale
        console.log("Quantity:", Quantity);
        console.log("Product Price:", product.Price);
        console.log("Total Price:", Quantity * product.Price);

        // Create a new sale record
        const sale = new Sale({
            CusName,
            CusAdd,
            CusContact,
            ProductID: product.ProductID,
            ProductName: product.ProductName,
            Quantity,
            MethPay,
            NumMonths,
            AmountPayment,
            TotalPrice: Quantity * product.Price // Make sure product.Price exists
        });

        // Save the sale
        await sale.save();

        // Update the product quantity
        product.Quantity -= Quantity; // Decrease the product quantity
        await product.save(); // Save the updated product

        res.status(201).send("Sale added successfully");
    } catch (error) {
        console.error("Failed to add sale:", error);
        res.status(500).send("Failed to add sale");
    }
});






// Route to fetch categories
router.get('/api/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('Category'); // Get distinct categories from Product model
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Route to get product price by ID
router.get('/products/:id/price', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, price: product.price }); // Assuming your product has a 'price' field
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Route to fetch products by category
// Route to fetch products by category
router.get('/api/products', async (req, res) => {
    const { categoryId } = req.query; // Get categoryId from query

    if (!categoryId) {
        return res.status(400).json({ error: 'Category ID is required' });
    }

    try {
        // Correctly filter using the ObjectId of CategoryID
        const products = await Product.find({ CategoryID: categoryId }); // Change this line

        if (!products.length) {
            return res.status(404).json({ message: 'No products found for this category' });
        }

        res.json(products); // Send filtered products
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



// Route for managing sales
router.get('/', salesController.getSales); // Fetch all sales
router.post('/', salesController.addSale); // Add a new sale
router.delete('/:id', salesController.deleteSale); // Delete a sale

// Export the router
module.exports = router;
