const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
// const mysql = require('mysql2');

// Load environment variables
dotenv.config({ path: './.env' });
console.log('SENDGRID API KEY:', process.env.SENDGRID_API_KEY);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = 5000; // Backend server port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // To parse JSON bodies

// ================== OTP FUNCTIONALITY ==================

// In-memory store for OTPs (Note: Not suitable for production!)
const otpStore = {};

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Send OTP API
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const otp = generateOTP();
  otpStore[email] = otp;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL, // Must be verified in SendGrid
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`,
    html: `<h1>Your OTP is ${otp}</h1><p>This OTP is valid for 5 minutes.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: 'OTP sent successfully!' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP API
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const storedOtp = otpStore[email];

  if (storedOtp && parseInt(otp) === storedOtp) {
    delete otpStore[email]; // Remove OTP after successful verification
    return res.json({ success: true, message: 'OTP verified successfully!' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
});

// ================== PRODUCT DATA FUNCTIONALITY ==================

// // Database connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'your_username', // replace with your db username
//   password: 'your_password', // replace with your db password
//   database: 'inventoryDB'
// });

// // Connect to MySQL database
// db.connect(err => {
//   if (err) {
//     console.error('MySQL connection failed:', err);
//     process.exit(1);
//   }
//   console.log('MySQL connected...');
// });

// // Get all products
// app.get('/products', (req, res) => {
//   db.query('SELECT * FROM products', (err, result) => {
//     if (err) {
//       console.error('Error fetching products:', err);
//       return res.status(500).json({ message: 'Failed to retrieve products' });
//     }
//     res.json(result);
//   });
// });

// // Add a new product
// app.post('/products', (req, res) => {
//   const { id, name, sku, location, price, stock } = req.body;

//   if (!id || !name || !sku || !location || price == null || stock == null) {
//     return res.status(400).json({ message: 'All product fields are required' });
//   }

//   const query = 'INSERT INTO products (id, name, sku, location, price, stock) VALUES (?, ?, ?, ?, ?, ?)';
//   db.query(query, [id, name, sku, location, price, stock], (err, result) => {
//     if (err) {
//       console.error('Error adding product:', err);
//       return res.status(500).json({ message: 'Failed to add product' });
//     }
//     res.json({ message: 'Product added successfully!' });
//   });
// });

// // Update an existing product
// app.put('/products/:id', (req, res) => {
//   const { name, sku, location, price, stock } = req.body;

//   const query = 'UPDATE products SET name=?, sku=?, location=?, price=?, stock=? WHERE id=?';
//   db.query(query, [name, sku, location, price, stock, req.params.id], (err, result) => {
//     if (err) {
//       console.error('Error updating product:', err);
//       return res.status(500).json({ message: 'Failed to update product' });
//     }
//     res.json({ message: 'Product updated successfully!' });
//   });
// });

// // Delete a product
// app.delete('/products/:id', (req, res) => {
//   db.query('DELETE FROM products WHERE id=?', [req.params.id], (err, result) => {
//     if (err) {
//       console.error('Error deleting product:', err);
//       return res.status(500).json({ message: 'Failed to delete product' });
//     }
//     res.json({ message: 'Product deleted successfully!' });
//   });
// });

// ================== START SERVER ==================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
