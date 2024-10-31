const Sale = require('../models/Sale');
const Product = require('../models/Product');
const mongoose = require('mongoose'); // Import mongoose

// View Sales
const viewSales = async (req, res) => {
    try {
        const products = await Product.find();
        const sales = await Sale.find().populate('ProductID');
        const categories = [...new Set(products.map(product => product.Category))];

        const admin = req.session.admin || {};
        res.render('admin/sales', { sales, categories, admin }); // Make sure 'categories' is included
    } catch (error) {
        console.error('Error in viewSales:', error);
        res.status(500).send(`Server Error: ${error.message}`);
    }
};



// Get Sales
const getSales = async (req, res) => {
    try {
        const sales = await Sale.find().populate('ProductID', 'ProductName'); // Populate ProductID to get ProductName
        const admin = req.session.admin || {}; // Use an empty object as a fallback

        if (!admin) {
            return res.redirect('/auth/login');
        }

        // Log for debugging
        console.log('Fetched Sales:', sales);
        
        res.render('admin/sales', { sales, admin }); 
    } catch (error) {
        console.error('Error fetching sales:', error); // More specific error logging
        res.status(500).send(`Server Error: ${error.message}`); // Send error message back to client
    }
};




// Add Sale
const addSale = async (req, res) => {
    try {
        const { CusName, Date, CusAdd, CusContact, ProductID, Quantity, MethPay, NumMonths, AmountPayment, Balance } = req.body;

        // Check if ProductID is valid
        if (!mongoose.Types.ObjectId.isValid(ProductID)) {
            return res.status(400).json({ success: false, message: 'Invalid Product ID' });
        }

        // Check if the product exists
        const product = await Product.findById(ProductID);
        if (!product) {
            return res.status(400).json({ success: false, message: 'Product not found' });
        }

        // Check if there's enough stock
        if (product.Stock < Quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }

        const newSale = new Sale({
            CusName,
            Date: Date || new Date(), // Default to current date if not provided
            CusAdd,
            CusContact,
            ProductID: product._id, // Ensure you use the ObjectId
            ProductName: product.ProductName, // Store ProductName in Sale
            Quantity,
            MethPay,
            NumMonths: NumMonths || null, // Ensure NumMonths is null if not provided
            AmountPayment,
            Balance
        });

        await newSale.save();
        
        // Update product stock
        product.Stock -= Quantity;
        await product.save();

        res.status(201).json(newSale); // Return the created sale
    } catch (error) {
        console.error('Error adding sale:', error); // Log the full error
        res.status(500).json({ message: 'Error adding sale', error: error.message }); // Return the error message
    }
};




// Delete Sale
// Delete Sale
const deleteSale = async (req, res) => {
    try {
        const saleId = req.params.saleId; // Use 'saleId' to match your route

        // Check if the saleId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(saleId)) {
            return res.status(400).send({ message: 'Invalid Sale ID' });
        }

        // Attempt to delete the sale
        const sale = await Sale.findById(saleId); // Use saleId to find the sale
        if (!sale) {
            return res.status(404).send({ message: 'Sale not found' });
        }

        await Sale.findByIdAndDelete(saleId);

        // Restore product stock
        const product = await Product.findById(sale.ProductID);
        if (product) {
            product.Stock += sale.Quantity; // Increase stock back
            await product.save();
        }

        res.status(200).send({ message: 'Sale deleted successfully' });
    } catch (error) {
        console.error('Error deleting sale:', error.message);
        res.status(500).send({ message: 'Failed to delete sale', error: error.message });
    }
};


// Update Sale
const updateSale = async (req, res) => {
    const { id } = req.params; // Assuming you have an ID to update
    const { Quantity, AmountPayment, MethPay, NumMonths } = req.body; // Adjust these fields based on your Sale model

    try {
        // Find the existing sale
        const existingSale = await Sale.findById(id);
        if (!existingSale) {
            return res.status(404).json({ success: false, message: 'Sale not found' });
        }

        // Find the product associated with the sale
        const product = await Product.findById(existingSale.ProductID);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check stock availability
        const stockDifference = Quantity - existingSale.Quantity; // Calculate the difference in stock
        if (product.Stock < stockDifference) {
            return res.status(400).json({ success: false, message: 'Insufficient stock available' });
        }

        // Update the sale record
        existingSale.Quantity = Quantity;
        existingSale.AmountPayment = AmountPayment;
        existingSale.MethPay = MethPay;
        existingSale.NumMonths = NumMonths || null; // Ensure NumMonths is null if not provided
        existingSale.TotalPrice = Quantity * product.Price; // Assuming TotalPrice is calculated based on Quantity and Price

        await existingSale.save(); // Save updated sale record

        // Adjust the product stock
        product.Stock -= stockDifference; // Adjust stock based on the new quantity
        await product.save(); // Save updated product stock

        res.status(200).json({ success: true, message: 'Sale updated successfully', sale: existingSale });
    } catch (error) {
        console.error('Error updating sale:', error); // Log the full error
        res.status(500).json({ success: false, message: 'Error updating sale', error: error.message }); // Return the error message
    }
};


module.exports = { addSale, getSales, updateSale, deleteSale, viewSales };
