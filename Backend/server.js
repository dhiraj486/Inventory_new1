// const express = require('express');
// const cors = require("cors");
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const sgMail = require('@sendgrid/mail');
// const mysql = require('mysql2');
// // const fs = require('fs'); // Import file system module
// // const dbFilePath = './db.json';

// // Load environment variables
// dotenv.config({ path: './.env' });
// console.log('SENDGRID API KEY:', process.env.SENDGRID_API_KEY);

// // Initialize SendGrid
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const app = express();
// const PORT = 5000; // Backend server port


// // Middleware
// app.use(cors());
// app.use(cors({ origin: "http://localhost:3000" })); // Adjust frontend URL if necessary
// app.use(bodyParser.json());
// app.use(express.json()); // To parse JSON bodies

// // ================== OTP FUNCTIONALITY ==================

// // In-memory store for OTPs (Note: Not suitable for production!)
// // const tempDB = {
// //   users: {},     // email -> { otp, expiresAt }
// //   sessions: {},  // token -> { email, expiresAt }
// // };

// const otpStore = {};

// // Generate OTP function
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000);
// };

// // Send OTP API
// app.post('/api/send-otp', async (req, res) => {
//   const { email } = req.body;
//   if (!email) {
//     return res.status(400).json({ success: false, message: 'Email is required' });
//   }
//   const otp = generateOTP();
//   otpStore[email] = otp;
//   const msg = {
//     to: email,
//     from: process.env.SENDER_EMAIL,
//     subject: 'Your OTP Code',
//     text: `Your OTP is ${otp}`,
//     html: `<h1>Your OTP is ${otp}</h1><p>This OTP is valid for 5 minutes.</p>`,
//   };
//   try {
//     await sgMail.send(msg);
//     console.log(`OTP sent to ${email}: ${otp}`);
//     res.json({ success: true, message: 'OTP sent successfully!' });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ success: false, message: 'Failed to send OTP' });
//   }
// });

// // Verify OTP API
// app.post('/api/verify-otp', (req, res) => {
//   const { email, otp } = req.body;
//   if (!email || !otp) {
//     return res.status(400).json({ success: false, message: 'Email and OTP are required' });
//   }
//   const storedOtp = otpStore[email];
//   if (storedOtp && parseInt(otp) === storedOtp) {
//     delete otpStore[email]; // Remove OTP after successful verification
//     return res.json({ success: true, message: 'OTP verified successfully!' });
//   } else {
//     return res.status(400).json({ success: false, message: 'Invalid OTP' });
//   }
// });

// // ================== PRODUCT DATA FUNCTIONALITY ==================

// // Database connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: 'Manoj_1234',
//   database: 'inventorydb'
// });
// // Connect to MySQL database
// db.connect(err => {
//   if (err) {
//     console.error('MySQL connection failed:', err);
//     process.exit(1);
//   }
//   console.log('MySQL connected...');
// });

// // Dasboard


// // Connect to MySQL database
// const createTableQuery = `
// CREATE TABLE IF NOT EXISTS products (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(255) NOT NULL,
//     sku VARCHAR(50) UNIQUE NOT NULL,
//     location VARCHAR(255),
//     price DECIMAL(10,2) NOT NULL,
//     stock INT NOT NULL
// );
// `;

// db.query(createTableQuery, (err, result) => {
//     if (err) {
//         console.error("Error creating table:", err);
//     } else {
//         console.log("Products table is ready or already exists.");
//     }
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
//   const { name, sku, location, price, stock } = req.body;
//   if (!name || !sku || !location || price == null || stock == null) {
//     return res.status(400).json({ message: 'All product fields are required' });
//   }
//   const query = 'INSERT INTO products (name, sku, location, price, stock) VALUES (?, ?, ?, ?, ?)';
//   db.query(query, [name, sku, location, price, stock], (err, result) => {
//     if (err) {
//       console.error('Error adding product:', err);
//       return res.status(500).json({ message: 'Failed to add product' });
//     }
//     res.json({ message: 'Product added successfully!', productId: result.insertId });
//   });
// });

// // Update an existing product
// app.put('/products/:id', (req, res) => {
//   const { name, sku, location, price, stock } = req.body;
//   const productId = req.params.id;
//   if (!name || !sku || !location || price == null || stock == null) {
//     return res.status(400).json({ message: 'All fields are required for update' });
//   }
//   const query = 'UPDATE products SET name=?, sku=?, location=?, price=?, stock=? WHERE id=?';
//   db.query(query, [name, sku, location, price, stock, productId], (err, result) => {
//     if (err) {
//       console.error('Error updating product:', err);
//       return res.status(500).json({ message: 'Failed to update product' });
//     }
//     res.json({ message: 'Product updated successfully!' });
//   });
// });

// // Delete a product
// app.delete('/products/:id', (req, res) => {
//   const productId = req.params.id;
//   db.query('DELETE FROM products WHERE id = ?', [productId], (err, result) => {
//     if (err) {
//       console.error('Error deleting product:', err);
//       return res.status(500).json({ message: 'Failed to delete product' });
//     }
//     db.query('SELECT id FROM products ORDER BY id', (err, rows) => {
//       if (err) {
//         console.error('Error fetching products:', err);
//         return res.status(500).json({ message: 'Failed to fetch products for reordering' });
//       }
//       let newId = 1;
//       const updateQueries = rows.map((product) => {
//         return new Promise((resolve, reject) => {
//           const query = 'UPDATE products SET id = ? WHERE id = ?';
//           db.query(query, [newId++, product.id], (err, result) => {
//             if (err) {
//               reject(err);
//             } else {
//               resolve(result);
//             }
//           });
//         });
//       });
//       Promise.all(updateQueries)
//         .then(() => {
//           db.query('ALTER TABLE products AUTO_INCREMENT = ?', [newId], (err) => {
//             if (err) {
//               console.error('Error resetting AUTO_INCREMENT:', err);
//               return res.status(500).json({ message: 'Failed to reset AUTO_INCREMENT' });
//             }
//             res.json({ message: 'Product deleted and IDs re-shifted successfully!' });
//           });
//         })
//         .catch((err) => {
//           console.error('Error reassigning IDs:', err);
//           res.status(500).json({ message: 'Failed to reorder product IDs' });
//         });
//     });
//   });
// });

// // ================== START SERVER ==================



// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

// // analytics

// dotenv.config();

// // ✅ Create Sales Table for Analytics
//     const createSalesTableQuery = `
//       CREATE TABLE IF NOT EXISTS sales (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         product_id INT NOT NULL,
//         quantity INT NOT NULL,
//         total_price DECIMAL(10,2) NOT NULL,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
//       );
//     `;

//     db.query(createSalesTableQuery, (err) => {
//       if (err) {
//         console.error("❌ Error creating sales table:", err);
//       } else {
//         console.log("✅ Sales table is ready for analytics.");
//       }
//     });
// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// const routes = require('./routes');

// // Routes
// // ================== ANALYTICS ROUTES ==================

// // // Route to get total sales
// // app.get("/api/analytics/total-sales", (req, res) => {
// //   const query = "SELECT SUM(total_price) AS totalSales FROM sales";
  
// //   db.query(query, (err, result) => {
// //       if (err) {
// //           console.error("Error fetching total sales:", err);
// //           return res.status(500).json({ message: "Failed to retrieve total sales" });
// //       }
// //       res.json({ totalSales: result[0]?.totalSales || 0 });
// //   });
// // });

// // // Route to get sales per product
// // app.get("/api/analytics/sales-by-product", (req, res) => {
// //   const query = `
// //     SELECT p.name, SUM(s.quantity) AS totalSold, SUM(s.total_price) AS revenue
// //     FROM sales 
// //     JOIN products p ON s.product_id = p.id
// //     GROUP BY s.product_id
// //   `;

// //   db.query(query, (err, result) => {
// //       if (err) {
// //           console.error("Error fetching sales by product:", err);
// //           return res.status(500).json({ message: "Failed to retrieve sales data" });
// //       }
// //       res.json(result);
// //   });
// // });


// // Export the database connection
// app.locals.db = db;  // ✅ Make DB accessible in routes
// app.use('/api', routes);

// // Start Server
// // app.listen(PORT, () => {
// //   console.log(`Server running on http://localhost:${PORT}`);
// // });

// const express = require('express');
// const cors = require("cors");
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const dotenv = require('dotenv');
// const mysql = require('mysql2/promise');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(bodyParser.json());
// app.use(cookieParser());
// app.use(express.json());

// // Database connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'order_management',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // External API domains configuration
// const DOMAIN_APIS = [
//   'https://domain1.com/api/orders',
//   'https://domain2.com/api/orders',
//   'https://domain3.com/api/orders'
// ];

// // Export pool and DOMAIN_APIS for controllers.js
// module.exports = { pool, DOMAIN_APIS };

// // Lazy load routes to prevent circular dependency
// (async () => {
//   const routes = require('./routes');
//   app.use('/api', routes(pool));
// })();

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

const DOMAIN_APIS = [
  'https://domain1.com/api/orders',
  'https://domain2.com/api/orders',
  'https://domain3.com/api/orders'
];

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'admin1234',
  database: process.env.DB_NAME || 'inventory_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    try {
      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          otp VARCHAR(6),
          otp_expires TIMESTAMP,
          session_token VARCHAR(64),
          session_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create products table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          sku VARCHAR(50) UNIQUE NOT NULL,
          location VARCHAR(255),
          price DECIMAL(10,2) NOT NULL,
          stock INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sales table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sales (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

      // Create orders table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_name VARCHAR(255) NOT NULL,
          product VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          status ENUM('Pending', 'Delivered', 'Cancelled') DEFAULT 'Pending',
          source VARCHAR(50) DEFAULT 'manual',
          total_amount DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create customers table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          last_order_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database tables initialized successfully');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

module.exports = { pool, DOMAIN_APIS };

// Initialize routes
const routes = require('./routes')(pool);
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});