const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        'MONGODB_URI is not defined in environment variables.\n' +
        'Create a server/.env file with your MongoDB Atlas connection string.'
      );
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected.');
};

module.exports = { connectDB, disconnectDB };
