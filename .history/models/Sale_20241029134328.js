const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const SaleSchema = new mongoose.Schema({
    SaleID: { type: Number, unique: true },
    Date: { type: Date, default: Date.now },
    CusName: { type: String, required: true },
    CusAdd: { type: String, required: true },
    CusContact: { type: String, required: true },
    ProductID: { type: String, ref: 'Product', required: true }, // Keep ProductID as Number
    ProductName: { type: String, required: true }, // Add ProductName
    Quantity: { type: Number, required: true },
    MethPay: {
        type: String,
        required: true,
        enum: ['Cash', 'Credit Card', 'Installment']
    },
    NumMonths: { type: Number, required: function () { return this.MethPay === 'Installment'; } },
    AmountPayment: { type: Number, required: true },
    Balance: { type: Number, default: 0 },
    TotalPrice: { type: Number, required: true }
});

SaleSchema.plugin(AutoIncrement, { inc_field: 'SaleID' });

// Pre-save hook to calculate TotalPrice and fetch ProductName
SaleSchema.pre('save', async function (next) {
    try {
        if (!this.TotalPrice) {  // If TotalPrice is not provided
            const product = await mongoose.model('Product').findOne({ ProductID: this.ProductID });
            if (!product) {
                throw new Error('Product not found');
            }
            this.TotalPrice = this.Quantity * product.Price;  // Assume Price field in Product model
            this.ProductName = product.Name; // Assume Name field in Product model
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Sale', SaleSchema);
