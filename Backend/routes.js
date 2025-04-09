// const express = require('express');
// const router = express.Router();
// const { sendOtp, verifyOtp, createProduct, updateProduct } = require('./controllers');

// // ---------------- OTP Routes ----------------
// router.post('/send-otp', sendOtp);
// router.post('/verify-otp', verifyOtp);

// // ---------------- Product Routes ----------------
// router.post('/products', async (req, res) => {
//     const db = req.app.locals.db; // Pass db connection
//     await createProduct(req, res, db);
// });

// router.put('/products/:id', async (req, res) => {
//     const db = req.app.locals.db;
//     await updateProduct(req, res, db);
// });

// // ================== ANALYTICS ROUTES ==================
// // Total Sales
// router.get("/analytics/total-sales", (req, res) => {
//     const db = req.app.locals.db;
//     const query = "SELECT SUM(total_price) AS totalSales FROM sales";
//     console.log("Received request:", req.query);

//     db.query(query, (err, result) => {
//         if (err) {
//             console.error("❌ Error fetching total sales:", err);
//             return res.status(500).json({ message: "Failed to retrieve total sales" });
//         }
//         res.json({ totalSales: result[0]?.totalSales || 0 });
//     });
// });

// // Sales by Product
// router.get("/analytics/sales-by-product", (req, res) => {
//     const db = req.app.locals.db;
//     const query = `
//         SELECT p.name, SUM(s.quantity) AS totalSold, SUM(s.total_price) AS revenue
//         FROM sales s
//         JOIN products p ON s.product_id = p.id
//         GROUP BY s.product_id
//     `;

//     db.query(query, (err, result) => {
//         if (err) {
//             console.error("❌ Error fetching sales by product:", err);
//             return res.status(500).json({ message: "Failed to retrieve sales data" });
//         }
//         res.json(result);
//     });
// });

// // ✅ Export router
// module.exports = router;


// const express = require('express');
// // const router = express.Router();
// // const controllers = require('./controllers');

// // const {
// //   getDashboardData,
// //   getAllOrders,
// //   createOrder,
// //   updateOrder,
// //   getAllProducts,
// //   createProduct,
// //   updateProduct,
// //   deleteProduct,
// //   getAllCustomers,
// //   fetchOrdersFromAPIs
// // } = require('./controllers');

// module.exports = (pool) => {
//   const router = express.Router();
//   const controllers = require('./controllers')(pool); // Pass pool to controllers

//   // const {
//   //   getDashboardData,
//   //   getAllOrders,
//   //   createOrder,
//   //   updateOrder,
//   //   getAllProducts,
//   //   createProduct,
//   //   updateProduct,
//   //   deleteProduct,
//   //   getAllCustomers,
//   //   fetchOrdersFromAPIs
//   // } = require('./controllers');

//   // Authentication routes
//   router.post('/send-otp', controllers.sendOTP);
//   router.post('/verify-otp', controllers.verifyOTP);
//   router.get('/verify-token', controllers.verifyToken);
//   router.post('/logout', controllers.logout);

//   // Products routes
//   router.get('/products', controllers.getProducts);
//   router.post('/products', controllers.addProduct);
//   router.put('/products/:id', controllers.updateProduct);
//   router.delete('/products/:id', controllers.deleteProduct);

//   // Analytics routes
//   router.get('/analytics/total-sales', controllers.getTotalSales);
//   router.get('/analytics/orders', controllers.getOrders);

//   // Dashboard routes
//   router.get('/dashboard', controllers.getDashboardData);

//   // Orders routes
//   router.get('/orders', controllers.getAllOrders);
//   router.post('/orders', controllers.createOrder);
//   router.put('/orders/:id', controllers.updateOrder);
//   router.post('/orders/sync', controllers.fetchOrdersFromAPIs);

//   // Customers routes
//   router.get('/customers', controllers.getAllCustomers);

//   return router;
// };

const express = require('express');

module.exports = (pool) => {
  const router = express.Router();
  const controllers = require('./controllers')(pool);

  // Authentication routes
  router.post('/send-otp', controllers.sendOTP);
  router.post('/verify-otp', controllers.verifyOTP);
  router.get('/verify-token', controllers.verifyToken);
  router.post('/logout', controllers.logout);

  // Products routes
  router.get('/products', controllers.getAllProducts);
  router.post('/products', controllers.createProduct);
  router.put('/products/:id', controllers.updateProduct);
  router.delete('/products/:id', controllers.deleteProduct);
  router.put('/products/:id/stock', controllers.updateProductStock);

  // Analytics routes
  router.get('/analytics/total-sales', controllers.getTotalSales);
  router.get('/analytics/orders', controllers.getOrders);

  // Dashboard routes
  router.get('/dashboard', controllers.getDashboardData);

  // Orders routes
  router.get('/orders', controllers.getAllOrders);
  router.post('/orders', controllers.createOrder);
  router.put('/orders/:id', controllers.updateOrder);
  router.post('/orders/sync', controllers.fetchOrdersFromAPIs);

  // Customers routes
  router.get('/customers', controllers.getAllCustomers);

    // User routes
    router.get('/users/:email', controllers.getUserProfile);
    router.put('/users/profile', controllers.updateUserProfile);

  return router;
};