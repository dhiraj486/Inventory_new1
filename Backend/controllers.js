const nodemailer = require('nodemailer');
const otpStore = {}; // In-memory store for OTPs (replace with Redis/DB in production)

// Send OTP to email
const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP
const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const storedOtp = otpStore[email];

  if (storedOtp === otp) {
    delete otpStore[email]; // Optional: remove OTP after successful verification
    return res.json({ success: true, message: 'OTP verified successfully' });
  }

  return res.status(400).json({ success: false, message: 'Invalid OTP' });
};

module.exports = { sendOtp, verifyOtp };

// ✅ Create Product
export const createProduct = async (req, res, db) => {
  const { name, sku, location, price, stock } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO products (name, sku, location, price, stock) VALUES (?, ?, ?, ?, ?)',
      [name, sku, location, price, stock]
    );

    res.status(201).json({ message: 'Product added!', id: result.insertId });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res, db) => {
  const { id } = req.params;
  const { name, sku, location, price, stock } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE products SET name = ?, sku = ?, location = ?, price = ?, stock = ? WHERE id = ?',
      [name, sku, location, price, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated!' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};