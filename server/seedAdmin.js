const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  await connectDB();

  try {
    const existing = await User.findOne({ email: 'admin@military.com' });
    if (existing) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    await User.create({
      name: 'Super Admin',
      email: 'admin@military.com',
      password: 'admin123',      
      role: 'admin',
      base: 'Base Alpha',
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@military.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();