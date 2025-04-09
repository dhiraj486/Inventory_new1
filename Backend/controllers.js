// const nodemailer = require('nodemailer');

// const otpStore = {}; // In-memory store for OTPs (Replace with Redis/DB in production)

// // ✅ Send OTP
// const sendOtp = async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     otpStore[email] = otp;

//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: 'Your OTP Code',
//             text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
//         };

//         await transporter.sendMail(mailOptions);

//         res.json({ success: true, message: 'OTP sent successfully' });
//     } catch (error) {
//         console.error("❌ Error sending OTP:", error);
//         res.status(500).json({ success: false, message: 'Failed to send OTP' });
//     }
// };

// // ✅ Verify OTP
// const verifyOtp = (req, res) => {
//     const { email, otp } = req.body;

//     if (!email || !otp) {
//         return res.status(400).json({ success: false, message: 'Email and OTP are required' });
//     }

//     const storedOtp = otpStore[email];

//     if (storedOtp === otp) {
//         delete otpStore[email]; // Remove OTP after successful verification
//         return res.json({ success: true, message: 'OTP verified successfully' });
//     }

//     return res.status(400).json({ success: false, message: 'Invalid OTP' });
// };

// // ✅ Create Product
// const createProduct = async (req, res) => {
//     const db = req.app.locals.db; // Get DB from server.js
//     const { name, sku, location, price, stock } = req.body;

//     try {
//         const [result] = await db.execute(
//             'INSERT INTO products (name, sku, location, price, stock) VALUES (?, ?, ?, ?, ?)',
//             [name, sku, location, price, stock]
//         );

//         res.status(201).json({ message: 'Product added!', id: result.insertId });
//     } catch (error) {
//         console.error("❌ Error adding product:", error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // ✅ Update Product
// const updateProduct = async (req, res) => {
//     const db = req.app.locals.db;
//     const { id } = req.params;
//     const { name, sku, location, price, stock } = req.body;

//     try {
//         const [result] = await db.execute(
//             'UPDATE products SET name = ?, sku = ?, location = ?, price, stock = ? WHERE id = ?',
//             [name, sku, location, price, stock, id]
//         );

//         if (result.affectedRows === 0) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         res.json({ message: 'Product updated!' });
//     } catch (error) {
//         console.error("❌ Error updating product:", error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// // ✅ Get Analytics Data
// const getAnalytics = (req, res) => {
//     const db = req.app.locals.db; // Corrected DB reference
//     const { timeframe } = req.query;
//     let query = "SELECT * FROM sales";

//     if (timeframe === "daily") {
//       query += " WHERE DATE(created_at) = CURDATE()";
//       } else if (timeframe === "weekly") {
//       query += " WHERE YEARWEEK(created_at, 1) = YEARWEEK(NOW(), 1)"; 
//       } else if (timeframe === "monthly") {
//       query += " WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())";
//       } else if (timeframe === "6months") {
//       query += " WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)";
//       } else if (timeframe === "yearly") {
//       query += " WHERE YEAR(created_at) = YEAR(NOW())";
//     }
  
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error("❌ Database query failed:", err);
//             return res.status(500).json({ error: "Database query failed" });
//         }
//         res.json(results);
//     });
// };

// // ✅ Export all functions (CommonJS)
// module.exports = {
//     sendOtp,
//     verifyOtp,
//     createProduct,
//     updateProduct,
//     getAnalytics
// };

// const sgMail = require('@sendgrid/mail');
// const crypto = require('crypto');
// const { promisify } = require('util');
// const axios = require('axios');
// const { pool, DOMAIN_APIS } = require('./server');

// // Initialize SendGrid
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// // Generate OTP
// const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// const setPool = (dbPool) => {
//   pool = dbPool; // Set the pool variable
// };

// const sendOTP = async (req, res) => {
//   const { email } = req.body;
//   const db = req.app.locals.db;

//   if (!email) {
//     console.error('Error: Email is required');
//     return res.status(400).json({ success: false, message: 'Email is required' });
//   }

//   try {
//     const otp = generateOTP();
//     const expiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

//     // Check if user exists
//     db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
//       if (err) {
//         console.error('Database error while fetching user:', err);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//       }

//       if (results.length > 0) {
//         console.log(`User found: ${email}, updating OTP`);
//         db.query('UPDATE users SET otp = ?, otp_expires = ? WHERE email = ?', [otp, expiryTime, email], (updateErr) => {
//           if (updateErr) {
//             console.error('Error while updating OTP:', updateErr);
//             return res.status(500).json({ success: false, message: 'Internal server error' });
//           }
//         });
//       } else {
//         console.log(`User not found, inserting new OTP for ${email}`);
//         db.query(
//           'INSERT INTO users (email, otp, otp_expires, session_token, session_expires) VALUES (?, ?, ?, ?, ?)', 
//           [email, otp, expiryTime, 'default_token_value', new Date()], 
//           (insertErr) => {
//           if (insertErr) {
//             console.error('Error while inserting OTP:', insertErr);
//             return res.status(500).json({ success: false, message: 'Internal server error' });
//           }
//         });
//       }
//       console.log(`Generated OTP for ${email}: ${otp}`);

//       sgMail
//         .send({
//           to: email,
//           from: process.env.SENDER_EMAIL,
//           subject: 'Your Login OTP',
//           text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
//           html: `<h1>Your OTP is: ${otp}</h1><p>This OTP will expire in 10 minutes.</p>`
//         })
//         .then(() => {
//           console.log(`OTP sent successfully to ${email}`);
//           res.json({ success: true, message: 'OTP sent successfully' });
//         })
//         .catch((emailError) => {
//           console.error('Email error:', emailError);
//           res.status(500).json({ success: false, message: 'Failed to send OTP email' });
//         });
//     });
//   } catch (error) {
//     console.error('Server error in sending OTP:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// const verifyOTP = (req, res) => {
//   const { email, otp, rememberMe } = req.body;
//   const db = req.app.locals.db;

//   if (!email || !otp) {
//     console.error('Error: Email and OTP are required');
//     return res.status(400).json({ success: false, message: 'Email and OTP are required' });
//   }

//   // Query to check if OTP exists and is not expired
//   const query = 'SELECT otp FROM users WHERE email = ? AND otp_expires > NOW()';
//   db.query(query, [email], (err, results) => {
//     if (err) {
//       console.error('Database error while fetching OTP:', err);
//       return res.status(500).json({ success: false, message: 'Internal server error' });
//     }

//     // Check if OTP is found
//     if (results.length === 0) {
//       console.error('Error: Invalid or expired OTP for email:', email);
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }

//     // Check if OTP matches
//     if (results[0].otp !== otp) {
//       console.error('Error: Incorrect OTP for email:', email);
//       return res.status(400).json({ success: false, message: 'Incorrect OTP' });
//     }

//     // Clear OTP after successful verification
//     db.query('UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = ?', [email], (clearErr) => {
//       if (clearErr) {
//         console.error('Error clearing OTP for email:', email, clearErr);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//       }

//       // Continue with session generation if OTP is verified
//       const sessionToken = crypto.randomBytes(32).toString('hex');
//       const expiryTime = rememberMe ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

//       // Store session in database
//       db.query('UPDATE users SET session_token = ?, session_expires = ? WHERE email = ?', 
//         [sessionToken, expiryTime, email], 
//         (updateSessionErr) => {
//           if (updateSessionErr) {
//             console.error('Error saving session for email:', email, updateSessionErr);
//             return res.status(500).json({ success: false, message: 'Internal server error' });
//           }

//           console.log(`Session token generated and saved for ${email}`);

//           // Set cookie with session token
//           res.cookie('session_token', sessionToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',  // Ensure secure cookie in production
//             sameSite: 'strict',
//             maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000  // Cookie duration
//           });

//           // Send final success message
//           console.log(`OTP verified successfully and session created for ${email}`);
//           res.json({ success: true, message: 'OTP verified and session created successfully' });
//         });
//     });
//   });
// };

// // const verifyOTP = (req, res) => {
// //   const { email, otp, rememberMe } = req.body;
// //   const db = req.app.locals.db;

// //   if (!email || !otp) {
// //     return res.status(400).json({ success: false, message: 'Email and OTP are required' });
// //   }

// //   // Query to check if OTP exists and is not expired
// //   const query = 'SELECT otp FROM users WHERE email = ? AND otp_expires > NOW()';
// //   db.query(query, [email], (err, results) => {
// //     if (err) {
// //       console.error('Database error:', err);
// //       return res.status(500).json({ success: false, message: 'Internal server error' });
// //     }

// //     // Check if OTP is found
// //     if (results.length === 0) {
// //       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
// //     }

// //     // Check if OTP matches
// //     if (results[0].otp !== otp) {
// //       return res.status(400).json({ success: false, message: 'Incorrect OTP' });
// //     }

// //     // Clear OTP after successful verification
// //     db.query('UPDATE users SET otp = NULL, otp_expires = NULL WHERE email = ?', [email], (clearErr) => {
// //       if (clearErr) {
// //         console.error('Error clearing OTP:', clearErr);
// //         return res.status(500).json({ success: false, message: 'Internal server error' });
// //       }

// //       // Continue with session generation if OTP is verified
// //       const sessionToken = crypto.randomBytes(32).toString('hex');
// //       const expiryTime = rememberMe ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

// //       // Store session in database
// //       db.query('UPDATE users SET session_token = ?, session_expires = ? WHERE email = ?', 
// //         [sessionToken, expiryTime, email], 
// //         (updateSessionErr) => {
// //           if (updateSessionErr) {
// //             console.error('Error saving session:', updateSessionErr);
// //             return res.status(500).json({ success: false, message: 'Internal server error' });
// //           }

// //           // Set cookie with session token
// //           res.cookie('session_token', sessionToken, {
// //             httpOnly: true,
// //             secure: process.env.NODE_ENV === 'production',  // Ensure secure cookie in production
// //             sameSite: 'strict',
// //             maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000  // Cookie duration
// //           });

// //           // Send final success message
// //           res.json({ success: true, message: 'OTP verified and session created successfully' });
// //         });
// //     });
// //   });
// // };


// const verifyToken = (req, res) => {
//   res.json({ success: true, message: "Token verification not implemented yet" });
// };

// const checkSession = (req, res, next) => {
//   const sessionToken = req.cookies.session_token;
//   if (!sessionToken) {
//     return res.status(401).json({ success: false, message: 'Not authenticated' });
//   }

//   const db = req.app.locals.db;
//   db.query('SELECT * FROM users WHERE session_token = ? AND session_expires > NOW()', 
//     [sessionToken], 
//     (err, results) => {
//       if (err || results.length === 0) {
//         return res.status(401).json({ success: false, message: 'Session expired or invalid' });
//       }
//       req.user = results[0]; // Attach user info to request
//       next();
//     });
// };

// const logout = (req, res) => {
//   const sessionToken = req.cookies.session_token;
//   if (!sessionToken) {
//     return res.status(400).json({ success: false, message: 'Not logged in' });
//   }

//   const db = req.app.locals.db;
//   db.query('UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_token = ?', 
//     [sessionToken], 
//     (err) => {
//       if (err) {
//         return res.status(500).json({ success: false, message: 'Failed to log out' });
//       }
//       res.clearCookie('session_token');
//       res.json({ success: true, message: 'Logged out successfully' });
//     });
// };

// // Fetch orders from multiple domains
// const fetchOrdersFromAPIs = async (req, res) => {
//   try {
//     const conn = await pool.getConnection();
    
//     for (const apiUrl of DOMAIN_APIS) {
//       try {
//         const response = await axios.get(apiUrl);
//         const orders = response.data;

//         // Process orders in parallel using Promise.all
//         await Promise.all(orders.map(async (order) => {
//           const { orderId, customerName, product, quantity, status, source } = order;
          
//           await conn.query(
//             `INSERT INTO orders (order_id, customer_name, product, quantity, status, source)
//              VALUES (?, ?, ?, ?, ?, ?)
//              ON DUPLICATE KEY UPDATE 
//              customer_name = VALUES(customer_name),
//              product = VALUES(product),
//              quantity = VALUES(quantity),
//              status = VALUES(status)`,
//             [orderId, customerName, product, quantity, status, source]
//           );
//         }));
//       } catch (error) {
//         console.error(`Error fetching from ${apiUrl}:`, error);
//       }
//     }

//     conn.release();
//     res.json({ message: 'Orders fetched and updated successfully' });
//   } catch (error) {
//     console.error('Error in fetchOrdersFromAPIs:', error);
//     res.status(500).json({ error: 'Failed to fetch and update orders' });
//   }
// };

// // Dashboard Analytics
// const getDashboardData = async (req, res) => {
//   try {
//     const conn = await pool.getConnection();

//     // Get sales data
//     const [salesData] = await conn.query(`
//       SELECT 
//         DATE_FORMAT(created_at, '%Y-%m') as month,
//         SUM(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) THEN total_amount ELSE 0 END) as thisYear,
//         SUM(CASE WHEN YEAR(created_at) = YEAR(CURRENT_DATE) - 1 THEN total_amount ELSE 0 END) as lastYear
//       FROM orders
//       WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
//       GROUP BY month
//       ORDER BY month
//     `);

//     // Get customer status data
//     const [customerData] = await conn.query(`
//       SELECT 
//         COUNT(CASE WHEN last_order_date >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 END) as active,
//         COUNT(CASE WHEN last_order_date < DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY) THEN 1 END) as inactive
//       FROM customers
//     `);

//     // Get recent orders with source information
//     const [recentOrders] = await conn.query(`
//       SELECT o.*, c.name as customer_name 
//       FROM orders o
//       JOIN customers c ON o.customer_id = c.id
//       ORDER BY o.created_at DESC
//       LIMIT 10
//     `);

//     // Get orders by source
//     const [ordersBySource] = await conn.query(`
//       SELECT source, COUNT(*) as count
//       FROM orders
//       GROUP BY source
//     `);

//     conn.release();

//     res.json({
//       success: true,
//       payload: {
//         salesGraph: salesData,
//         customerStatus: customerData[0],
//         recentOrders,
//         ordersBySource
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching dashboard data:', error);
//     res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
//   }
// };

// // Orders Management
// const getAllOrders = async (req, res) => {
//   try {
//     const conn = await pool.getConnection();
//     const [orders] = await conn.query('SELECT * FROM orders ORDER BY created_at DESC');
//     conn.release();
//     res.json(orders);
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// };

// const createOrder = async (req, res) => {
//   try {
//     const { customerName, product, quantity, status, source } = req.body;
//     const conn = await pool.getConnection();
    
//     const [result] = await conn.query(
//       'INSERT INTO orders (customer_name, product, quantity, status, source) VALUES (?, ?, ?, ?, ?)',
//       [customerName, product, quantity, status || 'Pending', source || 'manual']
//     );
    
//     conn.release();
//     res.json({ message: 'Order created successfully', orderId: result.insertId });
//   } catch (error) {
//     console.error('Error creating order:', error);
//     res.status(500).json({ error: 'Failed to create order' });
//   }
// };

// const updateOrder = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status' });
//     }
    
//     const conn = await pool.getConnection();
//     await conn.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
//     conn.release();
    
//     res.json({ message: `Order ${id} updated to ${status}` });
//   } catch (error) {
//     console.error('Error updating order:', error);
//     res.status(500).json({ error: 'Failed to update order' });
//   }
// };

// // Products Management
// const getAllProducts = async (req, res) => {
//   try {
//     const conn = await pool.getConnection();
//     const [products] = await conn.query('SELECT * FROM products');
//     conn.release();
//     res.json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: 'Failed to fetch products' });
//   }
// };

// const createProduct = async (req, res) => {
//   try {
//     const { name, sku, location, price, stock } = req.body;
//     const conn = await pool.getConnection();
    
//     const [result] = await conn.query(
//       'INSERT INTO products (name, sku, location, price, stock) VALUES (?, ?, ?, ?, ?)',
//       [name, sku, location, price, stock]
//     );
    
//     conn.release();
//     res.json({ message: 'Product created successfully', productId: result.insertId });
//   } catch (error) {
//     console.error('Error creating product:', error);
//     res.status(500).json({ error: 'Failed to create product' });
//   }
// };

// const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, sku, location, price, stock } = req.body;
    
//     const conn = await pool.getConnection();
//     await conn.query(
//       'UPDATE products SET name = ?, sku = ?, location = ?, price = ?, stock = ? WHERE id = ?',
//       [name, sku, location, price, stock, id]
//     );
//     conn.release();
    
//     res.json({ message: 'Product updated successfully' });
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ error: 'Failed to update product' });
//   }
// };

// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const conn = await pool.getConnection();
//     await conn.query('DELETE FROM products WHERE id = ?', [id]);
//     conn.release();
//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({ error: 'Failed to delete product' });
//   }
// };

// // Customers Management
// const getAllCustomers = async (req, res) => {
//   try {
//     const conn = await pool.getConnection();
//     const [customers] = await conn.query(`
//       SELECT 
//         c.*,
//         COUNT(o.id) as total_orders,
//         SUM(o.total_amount) as total_spent,
//         MAX(o.created_at) as last_order_date
//       FROM customers c
//       LEFT JOIN orders o ON c.id = o.customer_id
//       GROUP BY c.id
//     `);
//     conn.release();
//     res.json(customers);
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     res.status(500).json({ error: 'Failed to fetch customers' });
//   }
// };


// const getTotalSales = (req, res) => {
//   const { timeframe } = req.query;
//   const db = req.app.locals.db;
//   let timeFilter = '';

//   switch(timeframe) {
//     case '1W':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
//       break;
//     case '1M':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
//       break;
//     case '6M':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
//       break;
//     case '1Y':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
//       break;
//     default:
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
//   }

//   const query = `
//     SELECT 
//       DATE(created_at) as date,
//       SUM(total_price) as value,
//       (SELECT SUM(total_price) FROM sales WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)) as lastYear,
//       (SELECT SUM(total_price) FROM sales WHERE created_at >= NOW()) as thisYear
//     FROM sales 
//     WHERE 1=1 ${timeFilter}
//     GROUP BY DATE(created_at)
//     ORDER BY date
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching sales data:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//     res.json({ graphData: results });
//   });
// };

// const getOrders = (req, res) => {
//   const { timeframe } = req.query;
//   const db = req.app.locals.db;
//   let timeFilter = '';

//   switch(timeframe) {
//     case '1W':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
//       break;
//     case '1M':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
//       break;
//     case '6M':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
//       break;
//     case '1Y':
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
//       break;
//     default:
//       timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
//   }

//   const query = `
//     SELECT 
//       status,
//       COUNT(*) as value,
//       COUNT(CASE WHEN created_at < DATE_SUB(NOW(), INTERVAL 1 PERIOD) THEN 1 END) as previous
//     FROM orders
//     WHERE 1=1 ${timeFilter}
//     GROUP BY status
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error('Error fetching orders data:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }
//     res.json({ pieData: results });
//   });
// };
// module.exports = {
//   sendOTP,
//   verifyOTP,
//   verifyToken,
//   checkSession,
//   logout,
//   fetchOrdersFromAPIs,
//   getDashboardData,
//   getAllOrders,
//   createOrder,
//   updateOrder,
//   getAllProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   getAllCustomers,
//   getTotalSales,
//   getOrders
// };

const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const axios = require('axios');
const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports = (pool) => {
  // Initialize SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  // Generate OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  return {
    // Authentication Controllers
    sendOTP: async (req, res) => {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      try {
        const connection = await pool.getConnection();
        try {
          const otp = generateOTP();
          const expiryTime = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

          await connection.query(
            'INSERT INTO users (email, otp, otp_expires) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, otp_expires = ?',
            [email, otp, expiryTime, otp, expiryTime]
          );

          await sgMail.send({
            to: email,
            from: process.env.SENDER_EMAIL,
            subject: 'Your Login OTP',
            text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
            html: `<h1>Your OTP is: ${otp}</h1><p>This OTP will expire in 10 minutes.</p>`
          });

          res.json({ success: true, message: 'OTP sent successfully' });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    },

    verifyOTP: async (req, res) => {
      const { email, otp, rememberMe } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
      }

      try {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.query(
            'SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expires > NOW()',
            [email, otp]
          );

          if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
          }

          const sessionToken = crypto.randomBytes(32).toString('hex');
          const expiryTime = rememberMe 
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)  // 7 days
            : new Date(Date.now() + 24 * 60 * 60 * 1000);     // 24 hours

          await connection.query(
            'UPDATE users SET otp = NULL, otp_expires = NULL, session_token = ?, session_expires = ? WHERE email = ?',
            [sessionToken, expiryTime, email]
          );

          res.cookie('session_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
          });

          res.json({ success: true, message: 'OTP verified successfully' });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    },

    verifyToken: (req, res) => {
      res.json({ success: true, message: "Token verification not implemented yet" });
    },

    logout: async (req, res) => {
      const sessionToken = req.cookies.session_token;
      if (!sessionToken) {
        return res.status(400).json({ success: false, message: 'Not logged in' });
      }

      try {
        const connection = await pool.getConnection();
        try {
          await connection.query(
            'UPDATE users SET session_token = NULL, session_expires = NULL WHERE session_token = ?',
            [sessionToken]
          );
          res.clearCookie('session_token');
          res.json({ success: true, message: 'Logged out successfully' });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    },

    // Product Controllers
    getAllProducts: async (req, res) => {
      try {
        const connection = await pool.getConnection();
        try {
          const [products] = await connection.query('SELECT * FROM products');
          res.json(products);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve products' });
      }
    },

    createProduct: async (req, res) => {
      const { name, sku, location, batch, hsn, price, stock } = req.body;

      // Validate input
      if (!name || !sku || !location || !batch || !hsn || !price || !stock) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      try {
        const connection = await pool.getConnection();
        try {
          const [result] = await connection.query(
            'INSERT INTO products (name, sku, location, batch, hsn, price, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, sku, location, batch, hsn, price, stock]
          );

          res.json({ 
            success: true, 
            message: 'Product added successfully!', 
            productId: result.insertId 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ success: false, message: 'Failed to add product' });
      }
    },

    updateProduct: async (req, res) => {
      const { id } = req.params;
      const { name, sku, location, batch, hsn, price, stock } = req.body;

      if (!name || !sku || !location || !batch || !hsn || !price || !stock) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      try {
        const connection = await pool.getConnection();
        try {
          const [result] = await connection.query(
            'UPDATE products SET name = ?, sku = ?, location = ?, batch = ?, hsn = ?, price = ?, stock = ? WHERE id = ?',
            [name, sku, location, batch, hsn, price, stock, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
          }

          res.json({ success: true, message: 'Product updated successfully!' });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
      }
    },

    deleteProduct: async (req, res) => {
      const { id } = req.params;

      try {
        const connection = await pool.getConnection();
        try {
          const [result] = await connection.query('DELETE FROM products WHERE id = ?', [id]);

          if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
          }

          res.json({ success: true, message: 'Product deleted successfully!' });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
      }
    },

       // Product Controllers with Stock Management
       updateProductStock: async (req, res) => {
        const { id } = req.params;
        const { changeAmount, changeType, reason } = req.body;
  
        try {
          const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
  
            // Update product stock
            const [result] = await connection.query(
              'UPDATE products SET stock = stock + ?, last_stock_update = NOW() WHERE id = ?',
              [changeType === 'increase' ? changeAmount : -changeAmount, id]
            );
  
            // Record stock change in history
            await connection.query(
              'INSERT INTO stock_history (product_id, change_amount, change_type, reason) VALUES (?, ?, ?, ?)',
              [id, changeAmount, changeType, reason]
            );
  
            await connection.commit();
            res.json({ success: true, message: 'Stock updated successfully' });
          } catch (error) {
            await connection.rollback();
            throw error;
          } finally {
            connection.release();
          }
        } catch (error) {
          console.error('Error updating stock:', error);
          res.status(500).json({ success: false, message: 'Failed to update stock' });
        }
      },

    // Analytics Controllers
    getTotalSales: async (req, res) => {
      const { timeframe } = req.query;
      let timeFilter = '';

      switch(timeframe) {
        case '1W':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case '1M':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case '6M':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
          break;
        case '1Y':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      }

      try {
        const connection = await pool.getConnection();
        try {
          const [results] = await connection.query(`
            SELECT 
              DATE(created_at) as date,
              SUM(total_price) as value
            FROM sales 
            WHERE 1=1 ${timeFilter}
            GROUP BY DATE(created_at)
            ORDER BY date
          `);
          res.json({ graphData: results });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    getOrders: async (req, res) => {
      const { timeframe } = req.query;
      let timeFilter = '';

      switch(timeframe) {
        case '1W':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case '1M':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case '6M':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)';
          break;
        case '1Y':
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default:
          timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      }

      try {
        const connection = await pool.getConnection();
        try {
          const [results] = await connection.query(`
            SELECT 
              status,
              COUNT(*) as value
            FROM orders
            WHERE 1=1 ${timeFilter}
            GROUP BY status
          `);
          res.json({ pieData: results });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching orders data:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    },

    // Dashboard Controllers
    getDashboardData: async (req, res) => {
      try {
        const connection = await pool.getConnection();
        try {
          // Get sales data
          const [salesData] = await connection.query(`
            SELECT 
              DATE_FORMAT(created_at, '%Y-%m') as month,
              SUM(total_amount) as total
            FROM orders
            WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
            GROUP BY month
            ORDER BY month
          `);

          // Get order status counts
          const [orderStatus] = await connection.query(`
            SELECT status, COUNT(*) as count
            FROM orders
            GROUP BY status
          `);

          // Get recent orders
          const [recentOrders] = await connection.query(`
            SELECT *
            FROM orders
            ORDER BY created_at DESC
            LIMIT 5
          `);

          // Get low stock alerts
          const [lowStock] = await connection.query(`
            SELECT name, stock, min_stock
            FROM products
            WHERE stock <= min_stock
          `);

          res.json({
            success: true,
            data: {
              salesData,
              orderStatus,
              recentOrders,
              lowStock
            }
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
      }
    },

    // Order Controllers
    getAllOrders: async (req, res) => {
      try {
        const connection = await pool.getConnection();
        try {
          const [orders] = await connection.query(
            'SELECT * FROM orders ORDER BY created_at DESC'
          );
          res.json(orders);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
    },

    createOrder: async (req, res) => {
      try {
        // Destructuring all required fields from the request body
        const { customerId, customerName, address, contactNumber, product, quantity, totalAmount, userEmail, status = 'Pending', source = 'manual' } = req.body;
        
        // Validate required fields (except for optional ones like `status` and `source`)
        if (!customerId || !customerName || !address || !contactNumber || !product || !quantity || !totalAmount || !userEmail) {
          return res.status(400).json({ success: false, message: 'All fields except status and source are required' });
        }
    
        const connection = await pool.getConnection();
        try {
          // Query to insert the new order into the `orders` table
          const [result] = await connection.query(
            `INSERT INTO orders (
              customer_id, 
              customer_name, 
              address, 
              contact_number, 
              product, 
              quantity, 
              total_amount, 
              status, 
              user_email, 
              source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [customerId, customerName, address, contactNumber, product, quantity, totalAmount, status, userEmail, source]
          );
    
          res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            orderId: result.insertId,
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create order'
        });
      }
    },        

    updateOrder: async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Pending', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      try {
        const connection = await pool.getConnection();
        try {
          const [result] = await connection.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
          );

          if (result.affectedRows === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'Order not found' 
            });
          }

          res.json({ 
            success: true, 
            message: `Order ${id} updated to ${status}` 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
      }
    },

    fetchOrdersFromAPIs: async (req, res) => {
      try {
        const connection = await pool.getConnection();
        try {
          const response = await axios.get('https://dummyjson.com/products');
          const products = response.data.products;

          // Process each product from the API
          for (const product of products) {
            // Here, we try to extract the customer email from the product or order data
            // If there's no customer email, we use a default one.
            let userEmail = product.reviewerEmail || 'default@example.com'; // Try to fetch from product's data or use a default

            // Check if the customer already exists in the customers table
            const [customerResult] = await connection.query(
              `SELECT id FROM customers WHERE email = ?`,
              [userEmail]  // Using the extracted or default email
            );

            let customer_id;

            if (customerResult.length === 0) {
              // If the customer does not exist, create a new customer with the provided or default email
              const [newCustomerResult] = await connection.query(
                `INSERT INTO customers (name, email) VALUES (?, ?)`,
                ['Guest', userEmail]  // Assuming 'Guest' for customer name
              );
              customer_id = newCustomerResult.insertId;
            } else {
              // If customer exists, use their customer ID
              customer_id = customerResult[0].id;
            }
            await connection.query(
              `INSERT INTO customers (name, email, phone, \`orders\`, price, total) 
               VALUES (?, ?, ?, ?, ?, ?) 
               ON DUPLICATE KEY UPDATE 
               price = VALUES(price), 
               total = VALUES(total)`,
              [
                product.reviewerName || 'Unknown',  // name
                product.id.toString(),  // email (assuming product.id is unique and corresponds to email)
                product.phone || '1234567890',  // phone (this might need adjustment if phone is different)
                product.title,  // order (use product title or name)
                product.price,  // price
                product.stock   // total (total should be price * quantity, consider this based on your logic)
              ]                       
            );

            // Create sample order
            const orderData = {
              customer_name: product.reviewerName || 'Unknown',  // Default value if reviewerName is missing
              address: product.comment || 'No address provided', 
              contact_number: '1234567890',
              product: product.title,
              quantity: Math.floor(Math.random() * 5) + 1,
              total_amount: product.price,
              status: 'Pending',
              user_email: req.body.userEmail || 'guest@example.com', 
              customer_id
            };

            await connection.query(
              `INSERT INTO orders (
                customer_name, 
                address,
                product, 
                quantity, 
                total_amount,
                status,
                user_email,
                customer_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                orderData.customer_name,
                orderData.address,
                orderData.product,
                orderData.quantity,
                orderData.total_amount,
                orderData.status,
                orderData.user_email,
                orderData.customer_id,    // Use the customer_id here
              ]
            );            
          }
          await connection.query('ALTER TABLE orders AUTO_INCREMENT = 1');
          console.log('Order sync completed and AUTO_INCREMENT reset to 1');
          res.json({ 
            success: true, 
            message: 'Orders and products synced successfully' 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error in fetchOrdersFromAPIs:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to sync orders and products' 
        });
      }
    },

    syncCustomerDataFromOrders: async (req, res) => {
      try {
        const connection = await pool.getConnection();
        try {
          // Step 1: Fetch all the distinct customers from the orders table
          const [ordersData] = await connection.query(`
            SELECT 
              c.id AS customer_id,
              c.name AS customer_name,
              c.email AS customer_email,
              c.phone AS customer_phone,
              COUNT(o.id) AS total_orders,
              SUM(o.total_amount) AS total_spent,
              MAX(o.created_at) AS last_order_date
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            GROUP BY c.id
          `);
    
          // Step 2: Process each customer and update their data in the customers table
          for (const customer of ordersData) {
            const { customer_id, customer_name, customer_email, customer_phone, total_orders, total_spent, last_order_date } = customer;
    
            // Step 3: Insert or Update customer details into the customers table
            await connection.query(`
              INSERT INTO customers (
                id, name, email, phone, total_orders, total_spent, last_order_date
              )
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                total_orders = VALUES(total_orders),
                total_spent = VALUES(total_spent),
                last_order_date = VALUES(last_order_date)
            `, [
              customer_id, 
              customer_name, 
              customer_email, 
              customer_phone, 
              total_orders, 
              total_spent, 
              last_order_date
            ]);
          }
    
          res.json({ 
            success: true, 
            message: 'Customer data synced successfully from orders' 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error in syncing customer data:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to sync customer data from orders' 
        });
      }
    },
    
    // Fetch all customers with order details
    getAllCustomers: async (req, res) => {
      try {
        const connection = await pool.getConnection();
        try {
          const [customers] = await connection.query(`
            SELECT 
              c.*,
              COUNT(o.id) AS total_orders,
              SUM(o.total_amount) AS total_spent,
              MAX(o.created_at) AS last_order_date
            FROM customers c
            LEFT JOIN orders o ON c.id = o.customer_id
            GROUP BY c.id
          `);
          res.json(customers);
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Failed to fetch customers' });
      }
    },

     // User Controllers
     updateUserProfile: async (req, res) => {
      const { email, name, profilePic } = req.body;
      try {
        const connection = await pool.getConnection();
        try {
          // Check if user exists
          const [existingUser] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );
          if (existingUser.length === 0) {
            // Create new user if doesn't exist
            await connection.query(
              'INSERT INTO users (email, name, profile_pic) VALUES (?, ?, ?)',
              [email, name, profilePic]
            );
          } else {
            // Update existing user
            await connection.query(
              'UPDATE users SET name = ?, profile_pic = ? WHERE email = ?',
              [name, profilePic, email]
            );
          }
          res.json({ 
            success: true, 
            message: 'Profile updated successfully' 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to update profile' 
        });
      }
    },

    getUserProfile: async (req, res) => {
      const { email } = req.params;
      try {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.query(
            'SELECT name, email, profile_pic FROM users WHERE email = ?',
            [email]
          );
          if (rows.length === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'User not found' 
            });
          }
          res.json({ 
            success: true, 
            data: rows[0] 
          });
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to fetch profile' 
        });
      }
    },
  };
};