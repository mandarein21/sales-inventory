const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 
            'mongodb+srv://gmercadouser:gmercadodbUser@cluster1.iwwa5.mongodb.net/gmercadoDB', {
            tls: true,
            tlsInsecure: false, // Ensure this is set to false unless you have a reason to trust invalid certificates
            serverSelectionTimeoutMS: 5000 // Optional: controls connection timeout
        });
        
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
