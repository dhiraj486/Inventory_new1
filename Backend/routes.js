const express = require('express');
const router = express.Router();
import { sendOtp, verifyOtp, createProduct, updateProduct } from './controllers.js';

// POST /api/send-otp
router.post('/send-otp', sendOtp);

// POST /api/verify-otp
router.post('/verify-otp', verifyOtp);

module.exports = router;

// ---------------- Product Routes ----------------
router.post('/products', async (req, res) => {
    const db = req.app.locals.db; // Pass db connection
    await createProduct(req, res, db);
  });
  
  router.put('/products/:id', async (req, res) => {
    const db = req.app.locals.db;
    await updateProduct(req, res, db);
  });
  
  export default router;